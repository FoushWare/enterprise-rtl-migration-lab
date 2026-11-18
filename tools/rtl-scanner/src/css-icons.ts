import postcss,{type Rule} from 'postcss';
import {hash,range,type Finding} from './model.js';
export const CSS_ICON_TRANSFORMATION_ID='css-icon-progression-mirror';
const marked=(r:Rule)=>r.nodes.some(n=>n.type==='comment'&&/^rtl-icon:\s*progression-right\s*$/.test(n.text.trim()));
const mirrored=(r:Rule,selector:string)=>r.selector===selector+':dir(rtl)'&&r.nodes.length===1&&r.nodes[0].type==='decl'&&r.nodes[0].prop==='scale'&&r.nodes[0].value==='-1 1'&&!r.nodes[0].important;
/** Explicit semantic opt-in only: property names and generic icon names do not prove intent. */
export function cssIconAnchors(path:string,source:string){
 const result:{path:string;range:Finding['range'];original:string;context:string;id:string;mechanism:'css'}[]=[];
 let root;try{root=postcss.parse(source,{from:undefined})}catch{return result}
 root.walkRules(r=>{if(marked(r)&&!root.nodes.some(n=>n.type==='rule'&&mirrored(n,r.selector))){const start=r.source!.start!.offset!,end=r.source!.end!.offset!;const original=source.slice(start,end),context='stylesheet/'+r.selector;result.push({path,range:range(source,start,end),original,context,id:hash(path+'|'+context+'|'+original),mechanism:'css'})}});return result;
}
export function proposeCssIcon(finding:Finding,source:string){
 const reject=(s:string):never=>{throw Error('CSS_ICON_'+s)};
 if(finding.ruleId!=='RTL.ICON.PROGRESSION'||finding.sourceMechanism!=='css'||!finding.path.endsWith('.css')||!/^RTL\.ICON\.PROGRESSION:[a-f0-9]{24,64}$/.test(finding.id))reject('EXPLICIT_SEMANTIC_MARKER_REQUIRED');
 if(finding.exceptionReason||['INTENTIONAL_LTR','INFORMATIONAL'].includes(finding.category)||finding.ownership!=='custom-css')reject('OWNER_OR_INTENT_REVIEW');
 const root=postcss.parse(source,{from:undefined});let rule:Rule|undefined;
 root.walkRules(r=>{if(r.source?.start?.offset===finding.range.start.offset&&r.source?.end?.offset===finding.range.end.offset)rule=r});
 if(!rule||source.slice(finding.range.start.offset,finding.range.end.offset)!==finding.original)reject('STALE_RANGE');
 const r=rule!;
 if(!marked(r)||r.parent?.type!=='root'||!/^\.[a-zA-Z_][\w-]*$/.test(r.selector))reject('FLAT_MARKED_CLASS_REQUIRED');
 if(r.nodes.some(n=>n.type!=='decl'&&n.type!=='comment')||r.nodes.some(n=>n.type==='comment'&&/rtl-physical\s*:/i.test(n.text)))reject('INTENT_OR_RULE_CONTENT_REVIEW');
 if(!r.nodes.some(n=>n.type==='decl'&&n.prop==='display'&&/^(inline-block|block)$/.test(n.value)))reject('DISPLAY_BOX_REQUIRED');
 let conflict=false;
 root.walkDecls(d=>{if(/^(?:transform(?:-|$)|scale$|rotate$|translate$|animation(?:-|$)|transition(?:-|$)|direction$|writing-mode$|all$)/.test(d.prop.toLowerCase()))conflict=true});
 root.walkRules(n=>{if(n!==r&&(n.selector.includes(r.selector)||n.selector.includes('*')))conflict=true});
 if(conflict)reject('CASCADE_OR_TRANSFORM_REVIEW');
 const newline=source.includes('\r\n')?'\r\n':'\n';
 return {transformationId:CSS_ICON_TRANSFORMATION_ID,reason:'Requires semantic review: author marked an LTR right-facing progression icon. Confirm this class targets only the graphic, with no text, brand, trend or framework-owned mirroring; horizontal-tb and inherited CSS direction are required. Preserve LTR; mirror only :dir(rtl). Inspect nested transforms and external styles.',patch:{findingId:finding.id,path:finding.path,startOffset:finding.range.start.offset,endOffset:finding.range.end.offset,expectedSha256:hash(finding.original),replacement:finding.original+newline+r.selector+':dir(rtl) { scale: -1 1; }'}};
}
