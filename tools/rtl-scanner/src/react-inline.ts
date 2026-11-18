import ts from 'typescript';
import {hash,type Finding} from './model.js';
import {directionalProperty,propertyConflict,readingEdgeReason} from './directional-properties.js';
import {hasIsolation} from './codemod.js';
export const REACT_INLINE_TRANSFORMATION_ID='react-inline-logical';
const css=(s:string)=>s.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
const camel=(s:string)=>s.replace(/-([a-z])/g,(_,c:string)=>c.toUpperCase());
export function proposeReactInline(finding:Finding,source:string){
 const reject=(s:string):never=>{throw Error('REACT_INLINE_'+s)};
 if(!['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(finding.ruleId)||finding.sourceMechanism!=='react-inline'||!/^.+\.[jt]sx$/.test(finding.path))reject('DIRECT_JSX_STYLE_ONLY');
 if(finding.exceptionReason||['INTENTIONAL_LTR','INFORMATIONAL'].includes(finding.category)||finding.ownership!=='custom-inline')reject('OWNER_OR_INTENT_REVIEW');
 if(!new RegExp('^'+finding.ruleId.replaceAll('.','\\.')+':[a-f0-9]{24,64}$').test(finding.id))reject('FINDING_IDENTITY');
 const file=ts.createSourceFile(finding.path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let target:ts.PropertyAssignment|undefined;
 function walk(n:ts.Node){if(ts.isPropertyAssignment(n)&&n.getStart(file)===finding.range.start.offset&&n.end===finding.range.end.offset)target=n;ts.forEachChild(n,walk)}walk(file);
 if(!target||source.slice(finding.range.start.offset,finding.range.end.offset)!==finding.original)reject('STALE_RANGE');
 const p=target!,object=p.parent;
 if(!ts.isObjectLiteralExpression(object)||!ts.isJsxExpression(object.parent)||!ts.isJsxAttribute(object.parent.parent)||object.parent.parent.name.getText(file)!=='style')reject('DIRECT_OBJECT_REQUIRED');
 const opening=object.parent.parent.parent.parent;
 if(!(ts.isJsxOpeningElement(opening)||ts.isJsxSelfClosingElement(opening))||!/^[a-z][a-z0-9]*$/.test(opening.tagName.getText(file)))reject('NATIVE_ELEMENT_REQUIRED');
 const element=opening as ts.JsxOpeningElement|ts.JsxSelfClosingElement;
 if(hasIsolation(element)||element.attributes.properties.some(a=>ts.isJsxSpreadAttribute(a)))reject('DIRECTION_OR_SPREAD_REVIEW');
 if(object.properties.some(n=>!ts.isPropertyAssignment(n)||ts.isComputedPropertyName(n.name)))reject('UNRESOLVED_OBJECT');
 if(/rtl-physical\s*:/i.test(object.getFullText(file)))reject('INTENTIONAL_PHYSICAL');
 if(!(ts.isIdentifier(p.name)||ts.isStringLiteral(p.name)))reject('PROPERTY_SPELLING');
 const key=(p.name as ts.Identifier|ts.StringLiteral).text;if(key.includes('-'))reject('PROPERTY_SPELLING');
 const value=p.initializer;
 const literal=(n:ts.Expression):string|undefined=>ts.isStringLiteral(n)?n.text:ts.isNumericLiteral(n)?n.text:ts.isPrefixUnaryExpression(n)&&n.operator===ts.SyntaxKind.MinusToken&&ts.isNumericLiteral(n.operand)?'-'+n.operand.text:undefined;
 const raw=literal(value);if(raw===undefined)reject('LITERAL_VALUE_REQUIRED');
 const spec=directionalProperty(css(key),raw!,!ts.isStringLiteral(value));if(!spec)reject('UNSUPPORTED_PROPERTY_OR_VALUE');
 const peers=object.properties.filter((n):n is ts.PropertyAssignment=>ts.isPropertyAssignment(n)&&n!==p);
 if(peers.some(n=>!(ts.isIdentifier(n.name)||ts.isStringLiteral(n.name))||propertyConflict(css(key),css((n.name as ts.Identifier|ts.StringLiteral).text),spec!.family)))reject('CASCADE_DECLARATION_CONFLICT');
 if(spec!.family==='positioning'&&!peers.some(n=>n.name.getText(file)==='position'&&ts.isStringLiteral(n.initializer)&&/^(absolute|fixed)$/.test(n.initializer.text)))reject('EXPLICIT_POSITION_REQUIRED');
 // No dynamic peer can silently introduce unresolved direction/cascade semantics.
 if(peers.some(n=>literal(n.initializer)===undefined))reject('DYNAMIC_PEER_REVIEW');
 const name=camel(spec!.logical),nameRaw=ts.isStringLiteral(p.name)?source[p.name.getStart(file)]+name+source[p.name.end-1]:name;
 let replacement=nameRaw+source.slice(p.name.end,p.end);
 if(spec!.family==='alignment'){
  if(!ts.isStringLiteral(value)||/\\/.test(value.getText(file)))reject('VALUE_SPELLING');
  replacement=source.slice(p.getStart(file),value.getStart(file))+source[value.getStart(file)]+spec!.value+source[value.end-1];
 }
 return {transformationId:REACT_INLINE_TRANSFORMATION_ID,reason:readingEdgeReason,patch:{findingId:finding.id,path:finding.path,startOffset:p.getStart(file),endOffset:p.end,expectedSha256:hash(finding.original),replacement}};
}
