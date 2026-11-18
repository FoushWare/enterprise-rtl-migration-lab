import valueParser from 'postcss-value-parser';
import postcss,{type Declaration,type Rule} from 'postcss';
import {hash,type Finding} from './model.js';
import {directionalProperty,propertyConflict,readingEdgeReason} from './directional-properties.js';

export const CSS_DIRECTIONAL_TRANSFORMATION_ID='css-directional-logical';
export function proposeCssDirectional(finding:Finding,source:string){
 const reject=(s:string):never=>{throw Error('CSS_DIRECTIONAL_'+s)};
 if(!['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(finding.ruleId)||finding.sourceMechanism!=='css'||!finding.path.endsWith('.css'))reject('STYLESHEET_ONLY');
 if(!new RegExp('^'+finding.ruleId.replaceAll('.','\\.')+':[a-f0-9]{24,64}$').test(finding.id))reject('FINDING_IDENTITY');
 if(finding.exceptionReason||['INTENTIONAL_LTR','INFORMATIONAL'].includes(finding.category))reject('INTENTIONAL_PHYSICAL');
 if(finding.ownership!=='custom-css')reject('OWNER_REQUIRES_REVIEW');
 const root=postcss.parse(source,{from:undefined});let target:Declaration|undefined;
 root.walkDecls(d=>{if(d.source?.start?.offset===finding.range.start.offset)target=d});
 if(!target||target.source?.end?.offset!==finding.range.end.offset||source.slice(finding.range.start.offset,finding.range.end.offset)!==finding.original)reject('STALE_RANGE');
 const d=target!;if(d.parent?.type!=='rule'||d.parent.parent?.type!=='root')reject('NESTED_OR_CONDITIONAL_RULE');
 const rule=d.parent as Rule;
 if(!/^\.[a-zA-Z_][\w-]*$/.test(rule.selector))reject('SIMPLE_CLASS_SELECTOR_REQUIRED');
 if(rule.nodes.some(n=>n.type!=='decl'&&n.type!=='comment'))reject('UNSUPPORTED_RULE_CONTENT');
 if(rule.nodes.some(n=>n.type==='comment'&&/rtl-physical\s*:|rtl-icon\s*:/i.test(n.text)))reject('INTENTIONAL_OR_ICON_REVIEW');
 let direction=false,collision=false;
 root.walkDecls(n=>{if(n.prop.toLowerCase()==='direction'||n.prop.toLowerCase()==='writing-mode'&&n.value!=='horizontal-tb')direction=true});
 if(direction)reject('DIRECTION_OR_WRITING_MODE_REVIEW');
 root.walkRules(r=>{if(r!==rule&&(r.selector.includes(rule.selector)||r.selector.includes('*')))collision=true});
 if(collision)reject('CASCADE_SELECTOR_CONFLICT');
 const spec=directionalProperty(d.prop,d.value);if(!spec)reject('UNSUPPORTED_PROPERTY_OR_VALUE');
 const peers=rule.nodes.filter((n):n is Declaration=>n.type==='decl'&&n!==d);
 if(peers.some(n=>propertyConflict(d.prop,n.prop.toLowerCase(),spec!.family)))reject('CASCADE_DECLARATION_CONFLICT');
 if(spec!.family==='positioning'&&!peers.some(n=>n.prop==='position'&&/^(absolute|fixed)$/.test(n.value)))reject('EXPLICIT_POSITION_REQUIRED');
 const offset=d.prop.length+(d.raws.between??':').length;
 if(source.slice(finding.range.start.offset,finding.range.start.offset+d.prop.length)!==d.prop)reject('PROPERTY_SPELLING');
 let replacement=spec!.logical+finding.original.slice(d.prop.length);
 if(spec!.family==='alignment'){
  if(finding.original.slice(offset,offset+d.value.length)!==d.value)reject('VALUE_RANGE');
  const token=valueParser(d.value).nodes.find(n=>n.type==='word')!;
  replacement=finding.original.slice(0,offset+token.sourceIndex)+spec!.value+finding.original.slice(offset+token.sourceEndIndex);
 }
 return {transformationId:CSS_DIRECTIONAL_TRANSFORMATION_ID,reason:readingEdgeReason,patch:{findingId:finding.id,path:finding.path,startOffset:finding.range.start.offset,endOffset:finding.range.end.offset,expectedSha256:hash(finding.original),replacement}};
}
