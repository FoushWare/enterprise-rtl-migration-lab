import ts from 'typescript';
import { createHash } from 'node:crypto';
import type { Finding } from './model.js';
import { type PatchRequest, type ReviewSession } from './review-session.js';
import { applyReviewPatch } from './review-session.js';

export const BIDI_TRANSFORMATION_ID = 'bidi-isolate-auto';
export interface TransformationProposal { readonly transformationId: typeof BIDI_TRANSFORMATION_ID; readonly patch: PatchRequest; readonly reason: string }
export class TransformationRejected extends Error { constructor(readonly code: string) { super(code); } }
const sha = (value: string) => createHash('sha256').update(value).digest('hex');

/** Detection keeps uncertain direction ancestors visible; proposals never overwrite them. */
export function hasIsolation(node: ts.Node, detection=false): boolean {
  for (let parent: ts.Node | undefined = node; parent; parent = parent.parent) {
    if (!(ts.isJsxElement(parent) || ts.isJsxSelfClosingElement(parent))) continue;
    const opening=ts.isJsxElement(parent)?parent.openingElement:parent;
    const tag=opening.tagName.getText();
    if(tag==='bdi'||tag==='bdo')return true;
    for(const p of opening.attributes.properties){
      if(ts.isJsxSpreadAttribute(p)){if(!detection)return true;continue;}
      if(p.name.getText()==='dir'&&(!detection||p.initializer&&ts.isStringLiteral(p.initializer)&&['ltr','auto'].includes(p.initializer.text)))return true;
      if(p.name.getText()!=='style')continue;
      const expression=p.initializer&&ts.isJsxExpression(p.initializer)?p.initializer.expression:undefined;
      if(!expression||!ts.isObjectLiteralExpression(expression)){if(!detection)return true;continue;}
      for(const prop of expression.properties){
        if(!ts.isPropertyAssignment(prop)){if(!detection)return true;continue;}
        const key=ts.isIdentifier(prop.name)||ts.isStringLiteral(prop.name)?prop.name.text:prop.name.getText();
        if(!detection&&['direction','unicodeBidi','writingMode'].includes(key))return true;
        if(detection&&key==='unicodeBidi'&&ts.isStringLiteral(prop.initializer)&&['isolate','isolate-override','plaintext'].includes(prop.initializer.text))return true;
      }
    }
  }
  return false;
}

export function proposeBidiIsolation(finding: Finding, source: string): TransformationProposal {
  if (finding.ruleId !== 'RTL.BIDI.ISOLATION' || !/^RTL\.BIDI\.ISOLATION:[a-f0-9]{24,64}$/.test(finding.id) || !/[.][jt]sx$/.test(finding.path) || /[\\\x00-\x1f]/.test(finding.path) || finding.path.startsWith('/') || finding.path.split('/').some(p=>!p||p==='.'||p==='..')) throw new TransformationRejected('UNSUPPORTED_FINDING_IDENTITY');
  if(finding.exceptionReason||['INTENTIONAL_LTR','INFORMATIONAL'].includes(finding.category))throw new TransformationRejected('INTENTIONAL_CONTENT_REQUIRES_REVIEW');
  const file = ts.createSourceFile(finding.path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let target: ts.JsxExpression | undefined;
  function visit(node: ts.Node): void { if (ts.isJsxExpression(node) && node.getStart(file) === finding.range.start.offset && node.end === finding.range.end.offset) target = node; ts.forEachChild(node, visit); }
  visit(file);
  if (!target) throw new TransformationRejected('UNSUPPORTED_AST_RANGE');
  if (!target.expression || !ts.isPropertyAccessExpression(target.expression) || !ts.isIdentifier(target.expression.expression) || !['id','name','email','address'].includes(target.expression.name.text)) throw new TransformationRejected('AMBIGUOUS_TOKEN_EXPRESSION');
  if (hasIsolation(target)) throw new TransformationRejected('ALREADY_ISOLATED');
  if (!target.parent || !(ts.isJsxElement(target.parent) || ts.isJsxFragment(target.parent))) throw new TransformationRejected('UNSUPPORTED_WRAPPER');
  const textContainers = new Set(['Link', 'a', 'span', 'div', 'p', 'strong', 'small', 'label', 'li', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  if (ts.isJsxElement(target.parent) && !textContainers.has(target.parent.openingElement.tagName.getText(file))) throw new TransformationRejected('UNSUPPORTED_TEXT_CONTAINER');
  for (let ancestor: ts.Node | undefined = target.parent; ancestor; ancestor = ancestor.parent) {
    if (ts.isJsxElement(ancestor) && ['svg', 'math', 'script', 'style', 'textarea', 'title', 'option', 'select'].includes(ancestor.openingElement.tagName.getText(file))) throw new TransformationRejected('UNSAFE_HTML_CONTEXT');
  }
  const original = source.slice(finding.range.start.offset, finding.range.end.offset);
  if (original !== finding.original ) throw new TransformationRejected('SOURCE_RANGE_MISMATCH');
  return { transformationId: BIDI_TRANSFORMATION_ID, reason: 'Requires semantic review: direct identifier.id/name/email/address text child in JSX; wrap only the verified expression in auto-direction bidi isolation. Preserve canonical text and copying; inspect punctuation in both directions.', patch: { findingId: finding.id, path: finding.path, startOffset: finding.range.start.offset, endOffset: finding.range.end.offset, expectedSha256: sha(original), replacement: '<bdi dir="auto">' + original + '</bdi>' } };
}

export async function dryRunBidiIsolation(session: ReviewSession, finding: Finding, source: string): Promise<{ proposal: TransformationProposal; candidate: ReviewSession }> {
  const proposal = proposeBidiIsolation(finding, source);
  const candidate = await applyReviewPatch(session, proposal.patch);
  return { proposal, candidate };
}

export function analyzeBidiIsolation(finding: Finding, source: string): TransformationProposal {
  return proposeBidiIsolation(finding, source);
}
