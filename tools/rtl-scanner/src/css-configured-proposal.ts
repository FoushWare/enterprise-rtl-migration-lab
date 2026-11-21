import postcss, { type Declaration } from 'postcss';
import { directionalProperty, propertyConflict } from './directional-properties.js';
import { hash, type Finding } from './model.js';

export const CSS_CONFIGURED_TRANSFORMATION_ID = 'css-configured-intent';

function replacementFor(declaration: Declaration, finding: Finding): string {
  const rule = declaration.parent;
  const intent = finding.cssProposal!;
  const { prop, value } = declaration;
  if (rule?.type !== 'rule') throw Error('CSS_INTENT_EXPECTED_RULE');
  const peers = rule.nodes.filter((node): node is Declaration => node.type === 'decl' && node !== declaration);
  const base = declaration.clone();
  const serialize = (declarations: Declaration[]) => declarations.map(d => d.toString()).join('; ') + (finding.original.endsWith(';') ? ';' : '');
  if (peers.some(d => d.prop === prop || /^(all|direction|writing-mode)$/.test(d.prop))) throw Error('CSS_INTENT_CONFLICTING_DECLARATIONS');
  if (intent.kind === 'inline-edge') {
    const spec = directionalProperty(prop,value);
    if (!spec || !['borders','positioning'].includes(spec.family)) throw Error('CSS_INTENT_UNSUPPORTED_EDGE');
    if (peers.some(d => propertyConflict(prop,d.prop,spec.family))) throw Error('CSS_INTENT_CONFLICTING_EDGE');
    if (spec.family === 'positioning' && !peers.some(d=>d.prop==='position'&&/^(absolute|fixed)$/.test(d.value))) throw Error('CSS_INTENT_EXPLICIT_POSITION_REQUIRED');
    base.prop = spec.logical;
    return serialize([base]);
  }
  if (intent.kind === 'dom-order') {
    if (prop !== 'flex-direction' || value !== 'row-reverse' || !peers.some(d => d.prop === 'display' && /^(inline-)?flex$/.test(d.value)) || peers.some(d=>d.prop==='flex-flow')) throw Error('CSS_INTENT_EXPLICIT_FLEX_ROW_REQUIRED');
    base.value = 'row';
    return serialize([base]);
  }
  if (intent.kind === 'logical-corners') {
    const radii = value.split(/\s+/);
    if (prop !== 'border-radius' || radii.length !== 4 || !radii.every(v => /^(0|\d+(?:\.\d+)?(?:px|rem|em|%))$/.test(v)) || peers.some(d => /^border-.*radius$/.test(d.prop))) throw Error('CSS_INTENT_FOUR_LITERAL_CORNERS_REQUIRED');
    return serialize(['start-start','start-end','end-end','end-start'].map((corner,i)=>declaration.clone({prop:`border-${corner}-radius`,value:radii[i]})));
  }
  if (intent.kind !== 'mirror-offset') throw Error('CSS_INTENT_UNKNOWN');
  const offset = prop === 'transform' ? /^translateX\((-?\d+(?:\.\d+)?)(%|px)\)$/.exec(value)
    : prop === 'box-shadow' ? /^(-?\d+(?:\.\d+)?)(px)\s+0(?:px)?\s+\d+(?:\.\d+)?px\s+#[\da-f]{3,8}$/i.exec(value) : null;
  if (!offset || Number(offset[1]) === 0) throw Error('CSS_INTENT_LITERAL_HORIZONTAL_OFFSET_REQUIRED');
  const variable = '--rtl-offset-' + hash(finding.context+'\0'+prop).slice(0,16);
  const literal = offset[1]+offset[2];
  base.value = value.replace(literal,`var(${variable}, ${literal})`);
  // Nest a direction-specific variable on the same target. Keep the original property and specificity.
  return `${base.toString()}; ${variable}: ${literal}; &:dir(rtl) { ${variable}: ${-Number(offset[1])}${offset[2]}; }`;
}

export function proposeConfiguredCss(finding: Finding, source: string) {
  const intent = finding.cssProposal;
  if (!intent || intent.sourceDigest !== hash(source)) throw Error('CSS_INTENT_STALE_SOURCE');
  if (finding.exceptionReason || finding.ownership !== 'custom-css' || finding.sourceMechanism !== 'css' || !finding.path.endsWith('.css')) throw Error('CSS_INTENT_LOCAL_STYLESHEET_REQUIRED');
  const { start, end } = finding.range;
  const root = postcss.parse(source);
  let declaration: Declaration | undefined;
  root.walkDecls(node => {
    if (node.source?.start?.offset === start.offset && node.source?.end?.offset === end.offset) declaration = node;
  });
  if (!declaration || source.slice(start.offset,end.offset) !== finding.original) throw Error('CSS_INTENT_STALE_RANGE');
  const d: Declaration = declaration;
  const rule = d.parent;
  if (rule?.type !== 'rule' || rule.parent?.type !== 'root' || !/^\.[a-zA-Z_][\w-]*(?: \.[a-zA-Z_][\w-]*)*$/.test(rule.selector) || finding.context !== 'stylesheet/'+rule.selector) throw Error('CSS_INTENT_UNSUPPORTED_SELECTOR');
  if (rule.nodes.some(node => node.type !== 'decl' && node.type !== 'comment') || rule.nodes.some(node => node.type==='comment' && /rtl-physical\s*:|rtl-icon\s*:/i.test(node.text))) throw Error('CSS_INTENT_UNSUPPORTED_RULE_CONTENT');
  const replacement = replacementFor(d, finding);
  postcss.parse(source.slice(0,start.offset)+replacement+source.slice(end.offset));
  return {transformationId:CSS_CONFIGURED_TRANSFORMATION_ID,reason:'Project declares direction intent for this exact source. Verify the rendered result in each direction before approval.',
    patch:{findingId:finding.id,path:finding.path,startOffset:start.offset,endOffset:end.offset,expectedSha256:hash(finding.original),replacement}};
}
