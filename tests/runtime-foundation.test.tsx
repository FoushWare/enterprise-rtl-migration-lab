import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTheme } from "@mui/material";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import type { Options } from "@emotion/cache";
import { readFileSync } from "node:fs";
import { extractTypescript } from "../tools/rtl-scanner/src/typescript";
import { detect } from "../tools/rtl-scanner/src/rules";
import { emptyPolicy } from "../tools/rtl-scanner/src/policy";
const captured = vi.hoisted(() => ({ calls: [] as { options: Options; instance: object }[] }));
vi.mock("@emotion/cache", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@emotion/cache")>();
  return { ...actual, default: (options: Options) => {
    const instance = actual.default(options);
    captured.calls.push({ options, instance });
    return instance;
  } };
});
import { theme, rtlTheme } from "../libs/design-system/src/runtime";
import { Provider, theme as publicTheme } from "@atlas/design-system";

it("preserves the public LTR theme identity and original configuration", () => {
  expect(publicTheme).toBe(theme);
  expect(theme.direction).toBe("ltr");
  expect(theme.palette.primary.main).toBe("#4c58d6");
  expect(theme.palette.background.default).toBe("#f7f8fb");
  expect(theme.typography.fontFamily).toBe('Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
  expect(theme.shape.borderRadius).toBe(10);
  expect(theme.components?.MuiButton?.styleOverrides?.root).toEqual({ padding: "10px 18px" });
});
it("prepares equivalent stable themes with only direction differing", async () => {
  expect(rtlTheme.direction).toBe("rtl");
  // Generated function identities differ; serialized configuration and function outputs agree.
  const ltr = JSON.parse(JSON.stringify(theme)), rtl = JSON.parse(JSON.stringify(rtlTheme));
  delete ltr.direction; delete rtl.direction;
  expect(rtl).toEqual(ltr);
  expect(rtlTheme.spacing(2)).toBe(theme.spacing(2));
  const again = await import("../libs/design-system/src/runtime");
  expect(again.theme).toBe(theme); expect(again.rtlTheme).toBe(rtlTheme);
});
it("creates private stable caches once with distinct keys and exact processor order", async () => {
  const prepared = captured.calls.filter(c => c.options.stylisPlugins);
  expect(prepared.map(c => c.options.key)).toEqual(["css", "atlas-rtl"]);
  expect(prepared[0].options.stylisPlugins).toEqual([prefixer]);
  expect(prepared[1].options.stylisPlugins).toEqual([prefixer, rtlPlugin]);
  expect(prepared[0].instance).not.toBe(prepared[1].instance);
  const again = await import("../libs/design-system/src/runtime");
  expect(Object.keys(again).sort()).toEqual(["rtlTheme", "theme"]);
  expect(captured.calls.filter(c => c.options.stylisPlugins)).toEqual(prepared);
});
it("keeps the Provider using the public English theme without document synchronization", () => {
  const initialDir = document.documentElement.dir;
  function Probe() {
    const active = useTheme();
    // MUI 7 adds vars:null and merges the theme into its engine context.
    // The public export identity is checked separately; context is a derived object.
    expect(active).toEqual({ ...publicTheme, vars: null });
    expect(active.palette).toBe(publicTheme.palette);
    expect(active.components).toBe(publicTheme.components);
    return <output data-testid="theme">{active.direction}</output>;
  }
  render(<Provider><Probe /></Provider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("ltr");
  expect(document.documentElement.dir).toBe(initialDir);
});
it("extracts the prepared module without unsupported or blocking configuration diagnostics", () => {
  const path = "libs/design-system/src/runtime.tsx", source = readFileSync(path, "utf8");
  const extracted = extractTypescript(path, source);
  const diagnostics = [...extracted.diagnostics];
  const findings = detect(extracted.evidence, new Map([[path, source]]), emptyPolicy, diagnostics);
  expect(diagnostics.filter(d => d.blocking)).toEqual([]);
  expect(findings.some(f => f.ruleId === "RTL.RUNTIME.CACHE_UNVERIFIED")).toBe(false);
  // No CacheProvider is mounted: extraction is not runtime pipeline certification.
  expect(source).not.toContain("CacheProvider");
});
