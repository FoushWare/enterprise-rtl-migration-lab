# Conservative RTL CSS codemod

This tool consumes the scanner's existing, exact per-declaration approvals. It never creates approvals. The current application has **zero AUTO_CANDIDATE findings**; its dry run produces an empty patch. Remaining findings require semantic/runtime review, including deliberate chart, brand, numeric and dialog direction islands.

Build and inspect before applying:

```sh
npm run rtl:scan:build
npm run rtl:codemod -- --dry-run
npm run rtl:codemod:test
# Only after separate declaration review and an existing exact scanner approval:
npm run rtl:codemod -- --ids RTL.CSS.PHYSICAL:<approved-id> > /tmp/rtl-plan.json
npm run rtl:codemod -- --apply /tmp/rtl-plan.json --journal /tmp/rtl-rollback.json
npm run rtl:codemod -- --rollback /tmp/rtl-rollback.json
```

Plans record commit, scanner input/policy digests, exact evidence IDs and ranges, original/output bytes and hashes. Apply requires a clean committed checkout and recomputes the entire plan. It changes only property names, consumes only their existing approvals, and requires complete policy validation afterwards. Fixture tests exercise this flow; no production approval or conversion was made during delivery.

Supported scope: standalone plain CSS `margin-left/right`, `padding-left/right`, `border-left/right` and their width/style/color variants, with reviewed custom ownership and constant values. Reject MUI sx/theme units, functions/variables, cascade shorthand collisions, existing logical declarations, direction/writing-mode islands, pinned files, unknown paths, symlinks, stale/forged plans and partial approval consumption. Mapping left→inline-start/right→inline-end is valid only under the existing explicit semantic approval; this is not a universal equivalence.

All outputs are staged before replacement. A durable exclusive external journal precedes writes. Ordinary I/O failures recover exact original bytes; multi-file filesystem replacement is **not crash-atomic**. After interruption, use the journal against the same commit to restore either changed or unchanged members. Rollback refuses concurrent user edits and never resets Git. Review/commit source changes separately after runtime checks; the tool does not stage, commit or push.

Exit 0 means successful plan/apply/rollback; exit 2 means rejected input or verification failure. Retain the journal until review is complete. Journal/plan files contain source bytes and should remain outside the checkout, with restricted access.
