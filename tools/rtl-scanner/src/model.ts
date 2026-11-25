import { createHash } from "node:crypto";
export type Mechanism = "css" | "emotion-template" | "mui-sx" | "mui-theme" | "react-inline" | "html-root";
export interface Point { offset: number; line: number; column: number }
export interface Range { start: Point; end: Point }
export interface Evidence { id: string; path: string; mechanism: Mechanism; context: string; property: string; value: string; original: string; range: Range; semantics: string; tokens?: string[] }
export interface Diagnostic { impact?: "NONBLOCKING_DYNAMIC" | "DIRECTIONAL_UNSUPPORTED" | "SOURCE_FAILURE"; blocking?: boolean; rationale?: string; path: string; code: string; message: string; range: Range }
export type Category = "AUTO_CANDIDATE" | "MANUAL_REVIEW" | "RUNTIME_CONFIG" | "INTENTIONAL_LTR" | "INFORMATIONAL";
export type CssProposalKind = 'inline-edge' | 'logical-corners' | 'dom-order' | 'mirror-offset';
export interface CssProposalIntent { kind:CssProposalKind; sourceDigest:string }
export interface Finding { id:string; ruleId:string; ruleVersion:1; category:Category; severity:"Critical"|"Major"|"Minor"|"Info"; confidence:"High"|"Medium"|"Low"; title:string; sourceMechanism:Mechanism|"typescript-structure"; applications:string[]; path:string; range:Range; original:string; context:string; ownership:string; rationale:string; treatment:string; evidenceIds:string[]; relatedLocations:{path:string;range:Range}[]; issueIds:string[]; suggestion:{property:string;value:string}|null; limitation:string; cssProposal?:CssProposalIntent; exceptionReason?:string; originalCategory?:Category }
export interface Report { schemaVersion: 2; kind: "rtl-risk-report"; policyDigest:string; inputDigest: string; files: string[]; skipped: string[]; evidence: Evidence[]; diagnostics: Diagnostic[]; findings: Finding[]; metrics:{byCategory:Record<string,number>;bySeverity:Record<string,number>;byConfidence:Record<string,number>;uniqueAffectedFiles:number;referenceCaseIds:string[]}; complete: boolean }
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
// Line separators of the most recently ranged text, indexed once per text (not once per offset).
const LINE_SEPARATOR = /\r\n|\r|\n/g;
let indexedText: string | undefined;
let indexedStarts: number[] = [];
let indexedEnds: number[] = [];
function indexSeparators(text: string): void {
  if (text === indexedText) return;
  indexedText = text; indexedStarts = []; indexedEnds = [];
  for (const match of text.matchAll(LINE_SEPARATOR)) { indexedStarts.push(match.index!); indexedEnds.push(match.index! + match[0].length); }
}
/**
 * 1-based line and column of an offset, identical to splitting `text.slice(0, offset)` on /\r\n|\r|\n/.
 * A CRLF pair cut by the offset counts as a lone CR inside the prefix, exactly as that split does.
 */
export function range(text: string, start: number, end: number): Range {
  indexSeparators(text);
  const point = (offset: number): Point => {
    // Same cut as text.slice(0, offset): negative offsets count from the end, out-of-range offsets clamp.
    const cut = offset < 0 ? Math.max(0, text.length + offset) : Math.min(offset, text.length);
    let low = 0, high = indexedEnds.length;
    while (low < high) { const mid = (low + high) >> 1; if (indexedEnds[mid]! <= cut) low = mid + 1; else high = mid; }
    let count = low, lineStart = low > 0 ? indexedEnds[low - 1]! : 0;
    if (low < indexedStarts.length && indexedStarts[low]! < cut) { count = low + 1; lineStart = cut; }
    return { offset, line: count + 1, column: cut - lineStart + 1 };
  };
  return { start: point(start), end: point(end) };
}
export function fact(path: string, text: string, mechanism: Mechanism, context: string, property: string, value: string, start: number, end: number, semantics = "css", tokens?: string[]): Evidence {
  return { id: hash(`${path}|${mechanism}|${context}|${property}|${start}`).slice(0,24), path, mechanism, context, property, value, original: text.slice(start,end), range: range(text,start,end), semantics, ...(tokens ? {tokens} : {}) };
}
