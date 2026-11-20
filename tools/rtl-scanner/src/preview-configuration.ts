import {readFile,lstat,realpath} from 'node:fs/promises';
import {resolve,relative,isAbsolute,join} from 'node:path';
import {hash,type Finding} from './model.js';
import type {ContextMapping,ContextRoute} from './example-preview-mappings.js';
import {exampleContextMapping} from './example-preview-mappings.js';
import postcss from 'postcss';
import ts from 'typescript';

export const PREVIEW_CONFIGURATION='rtl-preview.config.json';
export interface ConfiguredRoute {id:string;path:string;ltr:string;rtl:string}
export interface ConfiguredApplication {viteConfig:string;entry:string;originalOrigin:string;readySelector:string;dataAdapter:'none'|'atlas';startupScript?:string;routes:ConfiguredRoute[]}
export interface SourcePreviewBinding {source:string;sourceSelector?:string;context?:string;sourceExpressions?:string[];targetSelector:string;routes:{application:string;route:string}[]}
export interface PreviewConfiguration {schemaVersion:1;applications:Record<string,ConfiguredApplication>;mappings:SourcePreviewBinding[];digest:string;builtinAtlas?:boolean}
const fail=(message:string):never=>{throw Error('PREVIEW_CONFIGURATION_INVALID: '+message)};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
function shape(x:unknown,keys:string[],label:string):asserts x is Record<string,unknown>{if(!object(x)||Object.keys(x).some(k=>!keys.includes(k)))fail(label+' shape/unknown field');}
const text=(x:unknown,max=1000):x is string=>typeof x==='string'&&x.length>0&&x.length<=max&&!/[\x00-\x1f]/.test(x);
export function previewRelativePath(path:unknown):asserts path is string{if(!text(path)||isAbsolute(path)||path.includes('\\')||path.split('/').some(p=>!p||p==='..'||p==='.'||['node_modules','.git'].includes(p)))fail('project-relative path required');}
export async function previewFile(root:string,path:string,directoryAllowed=false){
 const base=await realpath(root),target=resolve(base,path);if(relative(base,target).startsWith('..')||isAbsolute(relative(base,target)))fail('path escapes root');
 let cursor=base;for(const part of path.split('/')){cursor=join(cursor,part);if((await lstat(cursor)).isSymbolicLink())fail('symlink not allowed');}
 const info=await lstat(target);if(!info.isFile()&&!(directoryAllowed&&info.isDirectory()))fail('regular file required');return target;
}
async function configurationText(root:string){try{const path=join(root,PREVIEW_CONFIGURATION);if((await lstat(path)).isSymbolicLink())fail('symlink configuration');const value=await readFile(path,'utf8');if(value.length>200000)fail('size limit');return value}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return undefined;throw e}}
export async function previewConfigurationDigest(root:string){const raw=await configurationText(root);return raw===undefined?hash(''):hash('preview-config\0'+raw);}
export async function loadPreviewConfiguration(root:string):Promise<PreviewConfiguration>{
 const raw=await configurationText(root);if(raw===undefined){let builtinAtlas=false;try{const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));await previewFile(root,'apps/invoicing/src/components/InvoiceTable.tsx');await previewFile(root,'apps/procurement/vite.config.ts');builtinAtlas=pkg.name==='atlas-invoice';}catch{}return {schemaVersion:1,applications:{},mappings:[],digest:hash(''),builtinAtlas};}
 let x:unknown;try{x=JSON.parse(raw)}catch{fail('JSON parse')};shape(x,['schemaVersion','applications','mappings'],'root');
 if(x.schemaVersion!==1||!object(x.applications)||!Array.isArray(x.mappings))fail('schemaVersion/applications/mappings');
 const applications:Record<string,ConfiguredApplication>={};
 for(const [id,a] of Object.entries(x.applications as Record<string,unknown>)){
  if(!/^[a-z][a-z0-9-]{0,50}$/.test(id)||['__proto__','constructor','prototype'].includes(id))fail('application id');
  shape(a,['viteConfig','entry','originalOrigin','readySelector','dataAdapter','routes','startupScript'],'application');previewRelativePath(a.viteConfig);previewRelativePath(a.entry);
  if(a.startupScript!==undefined&&(!text(a.startupScript,100)||!/^[-\w:]+$/.test(a.startupScript)))fail('startup script');
  if(!/[.][cm]?[jt]s$/.test(a.viteConfig)||!text(a.readySelector)||!['none','atlas'].includes(String(a.dataAdapter))||!Array.isArray(a.routes)||!a.routes.length)fail('runtime fields');
  let u:URL;try{u=new URL(String(a.originalOrigin))}catch{fail('origin')};if(u!.protocol!=='http:'||u!.hostname!=='127.0.0.1'||!u!.port||u!.origin!==a.originalOrigin||['4318','4320'].includes(u!.port)||Number(u!.port)>=4202&&Number(u!.port)<=4212)fail('loopback original origin required; dashboard/companion/candidate ports reserved');
  const routes:ConfiguredRoute[]=[],ids=new Set<string>();
  for(const r of a.routes as unknown[]){shape(r,['id','path','ltr','rtl'],'route');if(!text(r.id,80)||ids.has(String(r.id))||!text(r.path)||!/^\/[a-zA-Z0-9/_-]*$/.test(r.path))fail('route id/path');ids.add(String(r.id));
   for(const key of ['ltr','rtl']){if(!text(r[key])||!String(r[key]).startsWith('/')||String(r[key]).startsWith('//')||String(r[key]).includes('\\'))fail('relative route URL');const url=new URL(String(r[key]),String(a.originalOrigin));if(url.origin!==a.originalOrigin||url.pathname!==r.path||url.hash)fail('route URL/path mismatch');}
   routes.push(r as unknown as ConfiguredRoute);
  }
  await previewFile(root,a.viteConfig);await previewFile(root,a.entry);
  applications[id]={...(a as unknown as ConfiguredApplication),routes};
 }
 const mappings:SourcePreviewBinding[]=[],seen=new Set<string>();
 for(const m of x.mappings as unknown[]){shape(m,['source','sourceSelector','context','targetSelector','routes'],'mapping');previewRelativePath(m.source);if(!text(m.targetSelector)||!Array.isArray(m.routes)||!m.routes.length||m.sourceSelector!==undefined&&!text(m.sourceSelector)||m.context!==undefined&&!text(m.context))fail('mapping fields');
  if(m.source.endsWith('.css')&&!text(m.sourceSelector))fail('CSS sourceSelector required');
  const key=JSON.stringify([m.source,m.sourceSelector,m.context]);if(seen.has(key))fail('ambiguous duplicate mapping');seen.add(key);await previewFile(root,m.source);
  const refs=new Set<string>();for(const ref of m.routes as unknown[]){shape(ref,['application','route'],'route reference');if(!text(ref.application)||!text(ref.route)||!applications[ref.application]?.routes.some(r=>r.id===ref.route)||refs.has(ref.application+':'+ref.route))fail('unknown/duplicate route reference');refs.add(ref.application+':'+ref.route)}
  const binding=m as unknown as SourcePreviewBinding;
  if(m.sourceSelector&&!m.source.endsWith('.css')){
   if(!/^[.#][a-zA-Z_][\w-]*$/.test(String(m.sourceSelector))||!/[.]tsx$/.test(String(m.source)))fail('JSX sourceSelector requires a simple class or id selector and a TSX source');
   const source=await readFile(await previewFile(root,String(m.source)),'utf8'),sf=ts.createSourceFile(String(m.source),source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),expressions=new Set<string>();
   const selector=String(m.sourceSelector),attribute=selector[0]==='.'?'className':'id',value=selector.slice(1);
   const matches=(node:ts.JsxOpeningLikeElement)=>node.attributes.properties.some(a=>ts.isJsxAttribute(a)&&a.name.getText(sf)===attribute&&a.initializer&&ts.isStringLiteral(a.initializer)&&(attribute==='className'?a.initializer.text.split(/\s+/).includes(value):a.initializer.text===value));
   const visit=(node:ts.Node,owned=false)=>{const next=ts.isJsxElement(node)?matches(node.openingElement)||owned:owned;if(next&&ts.isJsxExpression(node)&&node.expression)expressions.add(node.getText(sf));ts.forEachChild(node,child=>visit(child,next));};visit(sf);
   binding.sourceExpressions=[...expressions];
  }
  mappings.push(binding);
 }
 return {schemaVersion:1,applications,mappings,digest:hash('preview-config\0'+raw)};
}
export function configuredMapping(f:Finding,config:PreviewConfiguration):ContextMapping{
 const candidates=config.mappings.filter(m=>m.source===f.path&&(!m.context||m.context===f.context)&&(!m.sourceSelector||(f.sourceMechanism==='css'?f.context==='stylesheet/'+m.sourceSelector:m.sourceExpressions?.includes(f.original))));
 if(candidates.length>1)return {kind:'unresolved',label:'Ambiguous configured mapping',selector:'',routes:[],evidence:[],limitation:'More than one configured locator matches this source context; choose one explicit source binding.'};
 if(!candidates.length){if(config.digest===hash('') && config.builtinAtlas)return exampleContextMapping(f);return {kind:'unresolved',label:'No mapped preview for this finding.',selector:'',routes:[],evidence:[],limitation:'No mapped preview for this finding.'};}
 const m=candidates[0],routes:ContextRoute[]=m.routes.map(ref=>{const app=config.applications[ref.application],r=app.routes.find(r=>r.id===ref.route)!;return {id:ref.application+':'+r.id,application:ref.application,path:r.path,label:ref.application+' · '+r.path,urls:{ltr:r.ltr,rtl:r.rtl}}});
 const mapping:ContextMapping={kind:'targets',label:'Configured source binding · runtime verification required',selector:m.targetSelector,routes,evidence:[PREVIEW_CONFIGURATION+' · '+m.source+' · '+(m.sourceSelector||m.context||'file locator')],configured:true,sourceSelector:f.sourceMechanism==='css'?m.sourceSelector:undefined,limitation:'Configuration declares this relationship; the real route, loaded source rule and rendered target must be checked before Verified.'};
 if(m.sourceSelector&&f.sourceMechanism==='css'){try{const root=postcss.parse('.probe{'+f.original+'}');const decl=root.first?.type==='rule'?root.first.nodes.find(n=>n.type==='decl'):undefined;if(decl?.type==='decl')mapping.css={property:decl.prop,value:decl.value,selector:m.sourceSelector}}catch{/* Whole-rule findings still receive source-rule/target verification. */}}
 return mapping;
}
export const runtimeConfigName=(application:string)=>application==='invoicing'?'vite.config.mts':'vite.'+application+'.config.mts';
export function routeUrl(route:ContextRoute,mode:'ltr'|'rtl',origin:string){if(route.urls)return new URL(route.urls[mode],origin).href;const u=new URL(route.path,origin);u.searchParams.set('demo','unmigrated-rtl');u.searchParams.set('lang',mode==='rtl'?'ar':'en');return u.href;}
