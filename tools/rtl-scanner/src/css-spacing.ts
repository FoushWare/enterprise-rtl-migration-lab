import postcss, { type Declaration, type Rule } from 'postcss';
import valueParser from 'postcss-value-parser';
import { hash, type Finding } from './model.js';
import type { PatchRequest } from './review-session.js';

export const CSS_SPACING_TRANSFORMATION_ID='css-spacing-logical';
/** Syntactic proposal only. Accepting it declares horizontal-tb, LTR-authored reading-edge intent. */
export function proposeCssSpacing(finding:Finding,source:string):{transformationId:typeof CSS_SPACING_TRANSFORMATION_ID;patch:PatchRequest;reason:string} {
  const reject=(code:string):never=>{throw Error(code)};
  if(finding.ruleId!=='RTL.CSS.PHYSICAL'||finding.sourceMechanism!=='css'||!finding.path.endsWith('.css'))reject('CSS_SPACING_STYLESHEET_ONLY');
  if(!/^RTL\.CSS\.PHYSICAL:[a-f0-9]{24,64}$/.test(finding.id))reject('CSS_SPACING_FINDING_IDENTITY');
  if(finding.exceptionReason||finding.category==='INTENTIONAL_LTR'||finding.category==='INFORMATIONAL')reject('CSS_SPACING_INTENTIONAL_PHYSICAL');
  if(finding.ownership!=='custom-css')reject('CSS_SPACING_OWNER_REQUIRES_REVIEW');
  let root;try{root=postcss.parse(source,{from:undefined})}catch{reject('CSS_SPACING_PARSE_FAILED')}
  let target:Declaration|undefined;
  root!.walkDecls(d=>{if(d.source?.start?.offset===finding.range.start.offset)target=d});
  if(!target||target.source?.end?.offset!==finding.range.end.offset||source.slice(finding.range.start.offset,finding.range.end.offset)!==finding.original)reject('CSS_SPACING_STALE_RANGE');
  const d=target!,match=/^(margin|padding)-(left|right)$/.exec(d.prop);
  if(!match)reject('CSS_SPACING_UNSUPPORTED_PROPERTY');
  if(d.parent?.type!=='rule'||d.parent.parent?.type!=='root')reject('CSS_SPACING_NESTED_OR_CONDITIONAL_RULE');
  const rule=d.parent as Rule;
  if(!/^\.[a-zA-Z_][\w-]*$/.test(rule.selector))reject('CSS_SPACING_SIMPLE_CLASS_SELECTOR_REQUIRED');
  if(rule.nodes.some(n=>n.type!=='decl'&&n.type!=='comment'))reject('CSS_SPACING_UNSUPPORTED_RULE_CONTENT');
  if(rule.nodes.some(n=>n.type==='comment'&&/rtl-physical\s*:/i.test(n.text)))reject('CSS_SPACING_INTENTIONAL_PHYSICAL');
  // A stylesheet selector alone cannot establish ancestry or co-matching classes.
  // Proposal generation is syntactic; scoped browser evidence evaluates the actual
  // cascade (including inheritance and active conditions) before validation/Apply.
  // A directly declared non-horizontal mode is already conclusively unsupported.
  if(rule.nodes.some(n=>n.type==='decl'&&n.prop.toLowerCase()==='writing-mode'&&n.value.trim()!=='horizontal-tb'))reject('CSS_SPACING_DIRECTION_OR_WRITING_MODE_REVIEW');
  const family=match![1];
  const conflicts=(prop:string)=>prop==='all'||prop===family||prop.startsWith(family+'-inline')||prop.startsWith(family+'-block')||prop.startsWith(family+'-left')||prop.startsWith(family+'-right');
  let collision=false;
  root!.walkRules(r=>{if(r!==rule&&(r.selector.includes(rule.selector)||r.selector.includes('*'))&&r.nodes.some(n=>n.type==='decl'&&conflicts(n.prop.toLowerCase())))collision=true});
  if(collision)reject('CSS_SPACING_CASCADE_SELECTOR_CONFLICT');
  if(rule.nodes.some(n=>n!==d&&n.type==='decl'&&(conflicts(n.prop.toLowerCase())||n.prop.toLowerCase()==='position')))reject('CSS_SPACING_CASCADE_DECLARATION_CONFLICT');
  const tokens=valueParser(d.value).nodes.filter(n=>n.type!=='space'&&n.type!=='comment');
  if(tokens.length!==1||tokens[0].type!=='word'||!/^(-?(?:\d*\.)?\d+(?:px|em|rem|%|vw|vh|ch|ex)?|auto)$/.test(tokens[0].value)||family==='padding'&&tokens[0].type==='word'&&(/^-/.test(tokens[0].value)||tokens[0].value==='auto'))reject('CSS_SPACING_UNSUPPORTED_VALUE');
  if(tokens[0].type==='word'&&/^-?(?:\d*\.)?\d+$/.test(tokens[0].value)&&Number(tokens[0].value)!==0)reject('CSS_SPACING_UNITLESS_LENGTH');
  const logical=family+'-inline-'+(match![2]==='left'?'start':'end');
  const start=finding.range.start.offset,end=finding.range.end.offset;
  if(source.slice(start,start+d.prop.length)!==d.prop)reject('CSS_SPACING_UNSUPPORTED_PROPERTY_SPELLING');
  return {transformationId:CSS_SPACING_TRANSFORMATION_ID,reason:'Requires semantic review: horizontal-tb, LTR-authored reading-start/end spacing. RTL intentionally moves the side; physical coordinates are not preserved. Cross-stylesheet cascade and inherited writing mode must be reviewed. Value, formatting and !important are preserved.',patch:{findingId:finding.id,path:finding.path,startOffset:start,endOffset:end,expectedSha256:hash(finding.original),replacement:logical+finding.original.slice(d.prop.length)}};
}
