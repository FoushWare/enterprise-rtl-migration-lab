#!/usr/bin/env python3
"""Validate project-memory links and report source freshness without editing files."""

from __future__ import annotations

import re
import subprocess
import sys
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlsplit


MEMORY_DIR = Path(__file__).resolve().parent
ROOT = MEMORY_DIR.parents[1]
EXTERNAL_WORKTREE = "enterprise-rtl-migration-lab-study"
LINK_RE = re.compile(r"!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+[^)]*)?\)")
DATE_RE = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")
OPTIONAL_RE = re.compile(r"\b(optional|when present|if present|where available)\b", re.I)


def git(*args: str) -> subprocess.CompletedProcess[str] | None:
    """Run a read-only Git query, returning None when Git metadata is unavailable."""
    try:
        return subprocess.run(
            ["git", "-C", str(ROOT), *args],
            check=False,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.SubprocessError):
        return None


def memory_files() -> list[Path]:
    """Limit discovery to Markdown files in this memory directory."""
    return sorted(path for path in MEMORY_DIR.rglob("*.md") if path.is_file())


def verification_date(path: Path) -> date | None:
    """Read an explicit date from a memory entry; never infer one from file mtime."""
    match = DATE_RE.search(path.read_text(encoding="utf-8"))
    if not match:
        return None
    try:
        return date.fromisoformat(match.group(1))
    except ValueError:
        return None


def parse_target(raw: str) -> str:
    target = raw.strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1]
    return unquote(target)


def main() -> int:
    files = memory_files()
    required_missing: list[str] = []
    optional_missing: list[str] = []
    local_refs: list[tuple[Path, Path, str]] = []
    external_refs: list[str] = []
    external_declarations: set[Path] = set()
    link_count = 0

    for memory_file in files:
        text = memory_file.read_text(encoding="utf-8")
        for line_number, line in enumerate(text.splitlines(), 1):
            if EXTERNAL_WORKTREE in line:
                external_declarations.add(ROOT.parent / EXTERNAL_WORKTREE)
            optional = OPTIONAL_RE.search(line) is not None
            for match in LINK_RE.finditer(line):
                target = parse_target(match.group(1))
                parsed = urlsplit(target)
                if parsed.scheme or target.startswith("#"):
                    continue
                path_text = parsed.path
                if not path_text:
                    continue

                link_count += 1
                resolved = (memory_file.parent / path_text).resolve()
                source = f"{memory_file.relative_to(ROOT)}:{line_number} -> {target}"
                if not resolved.is_relative_to(ROOT):
                    external_refs.append(f"{source} [external: {'available' if resolved.exists() else 'missing'}]")
                    continue
                if not resolved.exists():
                    (optional_missing if optional else required_missing).append(source)
                    continue
                if resolved.is_file() and not resolved.is_relative_to(MEMORY_DIR):
                    local_refs.append((memory_file, resolved, source))

    # Only inspect Git metadata for source files actually referenced by memory.
    relative_sources = sorted({path.relative_to(ROOT).as_posix() for _, path, _ in local_refs})
    ls_result = git("ls-files", "-z", "--", *relative_sources) if relative_sources else None
    tracked = set(ls_result.stdout.split("\0")) if ls_result and ls_result.returncode == 0 else set()
    tracked.discard("")
    status_result = git("status", "--porcelain=v1", "--untracked-files=no", "--", *sorted(tracked)) if tracked else None
    dirty: set[str] = set()
    if status_result and status_result.returncode == 0:
        for row in status_result.stdout.splitlines():
            if len(row) >= 4:
                dirty.add(row[3:].split(" -> ")[-1])

    stale_commits: list[str] = []
    no_date: list[str] = []
    commit_dates: dict[str, date | None] = {}
    for memory_file in files:
        checked = verification_date(memory_file)
        linked = {
            path.relative_to(ROOT).as_posix()
            for owner, path, _ in local_refs
            if owner == memory_file and path.relative_to(ROOT).as_posix() in tracked
        }
        if not linked:
            continue
        if checked is None:
            no_date.append(str(memory_file.relative_to(ROOT)))
            continue
        for source in sorted(linked):
            if source in dirty:
                stale_commits.append(f"{memory_file.relative_to(ROOT)} references modified source {source}")
                continue
            if source not in commit_dates:
                result = git("log", "-1", "--format=%cs", "--", source)
                try:
                    commit_dates[source] = date.fromisoformat(result.stdout.strip()) if result and result.returncode == 0 and result.stdout.strip() else None
                except ValueError:
                    commit_dates[source] = None
            changed = commit_dates[source]
            if changed and changed > checked:
                stale_commits.append(
                    f"{memory_file.relative_to(ROOT)} references {source} (latest commit {changed}, verified {checked})"
                )

    print("Project Memory validation")
    print(f"Memory Markdown files: {len(files)}")
    print(f"Markdown links checked: {link_count} ({len(required_missing)} missing required, {len(optional_missing)} missing optional)")
    print(f"Git-linked sources: {len(tracked)} tracked, {len(relative_sources) - len(tracked)} untracked/unavailable baseline")
    if ls_result is None or ls_result.returncode != 0:
        print("Git freshness: unavailable (no usable Git metadata)")
    else:
        print(f"Potentially stale linked sources: {len(stale_commits)}")
        print(f"Memory entries without a verification date: {len(no_date)}")
    for item in stale_commits[:8]:
        print(f"  STALE? {item}")
    for item in no_date:
        print(f"  DATE? {item}")
    if optional_missing:
        for item in optional_missing[:8]:
            print(f"  OPTIONAL MISSING {item}")

    if external_declarations:
        for dependency in sorted(external_declarations):
            state = "available" if dependency.is_dir() else "not found here"
            print(f"External worktree dependency: {dependency.name} — {state} ({dependency})")
    for item in external_refs[:8]:
        print(f"  EXTERNAL {item}")

    if required_missing:
        for item in required_missing[:12]:
            print(f"  BROKEN REQUIRED {item}")
        remaining = len(required_missing) - 12
        if remaining > 0:
            print(f"  … and {remaining} more broken required references")
        return 1

    print("Required local references: PASS")
    print("Staleness is advisory; no memory facts were rewritten.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
