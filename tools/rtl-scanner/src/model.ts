import { createHash } from "node:crypto";
export type Mechanism = "css" | "emotion-template" | "mui-sx" | "mui-theme" | "react-inline" | "html-root";
export interface Point { offset: number; line: number; column: number }
export interface Range { start: Point; end: Point }
export interface Evidence { id: string; path: string; mechanism: Mechanism; context: string; property: string; value: string; original: string; range: Range; semantics: string; tokens?: string[] }
export interface Diagnostic { path: string; code: string; message: string; range: Range }
export interface Report { schemaVersion: 1; kind: "source-evidence-inventory"; inputDigest: string; files: string[]; skipped: string[]; evidence: Evidence[]; diagnostics: Diagnostic[]; findings: []; complete: boolean }
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function range(text: string, start: number, end: number): Range {
  const point = (offset: number): Point => { const lines = text.slice(0, offset).split(/\r\n|\r|\n/); return { offset, line: lines.length, column: lines.at(-1)!.length + 1 }; };
  return { start: point(start), end: point(end) };
}
export function fact(path: string, text: string, mechanism: Mechanism, context: string, property: string, value: string, start: number, end: number, semantics = "css", tokens?: string[]): Evidence {
  return { id: hash(`${path}|${mechanism}|${context}|${property}|${start}`).slice(0,24), path, mechanism, context, property, value, original: text.slice(start,end), range: range(text,start,end), semantics, ...(tokens ? {tokens} : {}) };
}
