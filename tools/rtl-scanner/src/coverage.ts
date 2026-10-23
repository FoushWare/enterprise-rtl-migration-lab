import ts from 'typescript';
import { hash, type Diagnostic, type Evidence } from './model.js';
import type { Policy } from './policy.js';
const presentation = new Set([
  'color',
  'bgcolor',
  'backgroundColor',
  'borderColor',
  'fill',
  'stroke',
  'fontSize',
  'fontWeight',
  'opacity',
]);
/**
 * Classify uncertainty conservatively before findings are trusted.
 * Dynamic presentation values can be nonblocking only through the bounded whitelist
 * or exact reviewed expression/source fingerprints; source failures remain blocking.
 * @param diagnostics - Raw parser and coverage diagnostics.
 * @param evidence - Facts used to locate dynamic expressions.
 * @param sources - Original text used to verify whole-source pins.
 * @param policy - Reviewed dynamic exceptions.
 * @returns New diagnostic records with impact, blocking status, and rationale.
 */
export function classifyDiagnostics(
  diagnostics: Diagnostic[],
  evidence: Evidence[],
  sources: Map<string, string>,
  policy: Policy,
): Diagnostic[] {
  return diagnostics.map((d) => {
    let blocking = true,
      impact: Diagnostic['impact'] = 'DIRECTIONAL_UNSUPPORTED',
      rationale =
        'Unresolved styling may contain directional declarations; safe classification is incomplete.';
    if (d.code.endsWith('_PARSE') || d.code === 'SOURCE_COVERAGE') {
      impact = 'SOURCE_FAILURE';
      rationale = 'Source/parser coverage failed.';
    } else if (d.code === 'DYNAMIC_VALUE') {
      const e = evidence.find(
        (e) =>
          e.path === d.path &&
          e.range.start.offset <= d.range.start.offset &&
          e.range.end.offset >= d.range.end.offset,
      );
      const exception = e
        ? policy.dynamicExceptions.find(
            (x) =>
              x.path === e.path &&
              x.property === e.property &&
              x.valueDigest === hash(e.value) &&
              x.sourceDigest === hash(sources.get(e.path) ?? ''),
          )
        : undefined;
      if (e && (presentation.has(e.property) || exception)) {
        blocking = false;
        impact = 'NONBLOCKING_DYNAMIC';
        rationale = exception
          ? exception.reason +
            ' Source and expression fingerprints match the data-only review exception.'
          : 'Dynamic presentation value does not block the current directional rules; expression is retained and not evaluated.';
      }
    } else if (d.code === 'UNRESOLVED_SX_OWNER') {
      const raw = (sources.get(d.path) ?? '').slice(
        d.range.start.offset,
        d.range.end.offset,
      );
      const sf = ts.createSourceFile(
        'fragment.tsx',
        `<X ${raw}/>`,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      let safe = false;
      function visit(n: ts.Node) {
        if (
          ts.isJsxAttribute(n) &&
          n.name.getText(sf) === 'sx' &&
          n.initializer &&
          ts.isJsxExpression(n.initializer) &&
          n.initializer.expression &&
          ts.isObjectLiteralExpression(n.initializer.expression)
        )
          safe = n.initializer.expression.properties.every(
            (p) =>
              ts.isPropertyAssignment(p) &&
              ts.isIdentifier(p.name) &&
              presentation.has(p.name.text) &&
              (ts.isNumericLiteral(p.initializer) ||
                ts.isStringLiteral(p.initializer)),
          );
        ts.forEachChild(n, visit);
      }
      visit(sf);
      if (safe) {
        blocking = false;
        impact = 'NONBLOCKING_DYNAMIC';
        rationale =
          'Unknown component owner, but the entire literal sx object contains only non-directional presentation keys.';
      }
    }
    return { ...d, impact, blocking, rationale };
  });
}
/**
 * Map report completeness and the optional findings gate to CLI status.
 * @returns 2 for incomplete coverage, 1 for gated findings, otherwise 0.
 */
export const exitCode = (complete: boolean, findings: number, gate: boolean) =>
  !complete ? 2 : gate && findings > 0 ? 1 : 0;
