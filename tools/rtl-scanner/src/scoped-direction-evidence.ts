import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { configuredMapping, loadPreviewConfiguration, routeUrl } from './preview-configuration.js';
import { contextualPreview } from './contextual-preview.js';
import { retryAcrossNavigation } from './page-navigation.js';
import type { ReviewWorkflow, WorkflowEntry } from './review-workflow.js';

/** Server-observed configured application states; the inspection iframe cannot supply this proof. */
export interface ScopedDirectionEvidence { version: 1; inputDigest: string; policyDigest: string; configurationDigest: string; sessionId: string; records: unknown[] }
export function sameScopedDirectionEvidence(a:ScopedDirectionEvidence|undefined,b:ScopedDirectionEvidence):boolean {
 return !!a && a.version===1 && JSON.stringify(a)===JSON.stringify(b);
}
export async function captureScopedDirectionEvidence(root:string,w:ReviewWorkflow,entries:WorkflowEntry[],prepare:(application:string)=>Promise<void>):Promise<ScopedDirectionEvidence>{
 if(!w.session||!entries.length)throw Error('DIRECTION_EVIDENCE_CANDIDATE_REQUIRED');
 const config=await loadPreviewConfiguration(root),records:unknown[]=[];
 const browser=await chromium.launch({headless:true});
 try {
  for(const entry of entries){
   const mapping=configuredMapping(entry.finding,config);
   if(!mapping.configured||!mapping.routes.length||!entry.patch)throw Error('DIRECTION_EVIDENCE_EXPLICIT_MAPPING_REQUIRED');
   for(const route of mapping.routes){
    const app=config.applications[route.application];if(!app)throw Error('DIRECTION_EVIDENCE_APPLICATION_REQUIRED');await prepare(route.application);
    for(const mode of ['ltr','rtl'] as const){
     const query=new URLSearchParams({inputDigest:w.inputDigest,policyDigest:w.policyDigest,findingId:entry.finding.id,routeId:route.id,mode});
     const info=await contextualPreview(root,query,w);
     if(!info.original?.available||!info.candidate?.available||!('origin' in info.original)||!('origin' in info.candidate))throw Error('DIRECTION_EVIDENCE_RUNTIME_IDENTITY_UNAVAILABLE');
     const values=[];
     for(const [role,descriptor] of [['original',info.original],['candidate',info.candidate]] as const){
      const page=await browser.newPage({viewport:{width:1280,height:800},locale:'en-US',timezoneId:'UTC'}),errors:string[]=[];
      page.on('pageerror',e=>errors.push(e.message));
      try {
       const expected=routeUrl(route,mode,descriptor.origin);
       await page.goto(expected,{waitUntil:'domcontentloaded',timeout:20000});
       const state=await retryAcrossNavigation(async()=>{
       await page.locator(app.readySelector).first().waitFor({state:'visible',timeout:10000});
       await page.waitForFunction(expectedMode=>getComputedStyle(document.documentElement).direction===expectedMode,mode,{timeout:10000});
       await page.locator(mapping.selector).first().waitFor({state:'visible',timeout:10000});
       // Sample the rendered state after startup transitions, not at a nondeterministic animation frame.
       await page.evaluate(()=>new Promise<void>(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done()))));
       await page.waitForFunction(selector=>{
        const targets = [...document.querySelectorAll(selector)];
        const elements = new Set<Element>();
        for(const target of targets) for(let element:Element|null=target;element;element=element.parentElement) elements.add(element);
        return targets.length>0 && [...elements].every(element=>element.getAnimations().every(animation=>
          !(animation.pending || animation.playState==='running') || !Number.isFinite(animation.effect?.getComputedTiming().endTime)));
       },mapping.selector,{timeout:10000});
       return await page.evaluate(({selector,expectedUrl,sourceSelector,path,icon})=>{
        const nodes=[...document.querySelectorAll(selector)];if(!nodes.length||nodes.length>100)throw Error('DIRECTION_EVIDENCE_TARGET_COUNT');
        const url=new URL(location.href),expected=new URL(expectedUrl);if(url.pathname!==expected.pathname||url.search!==expected.search||url.hash)throw Error('DIRECTION_EVIDENCE_ROUTE_CHANGED');
        if(sourceSelector){let matched=false;for(const sheet of [...document.styleSheets]){try{const owner=sheet.ownerNode as HTMLElement|null,source=owner?.getAttribute('data-vite-dev-id')?.replaceAll('\\','/');const link=owner?.tagName==='LINK'?new URL((owner as HTMLLinkElement).href,location.href):null;if(!(source?.endsWith('/'+path)||link?.origin===location.origin&&decodeURIComponent(link.pathname)==='/'+path))continue;const walk=(rules:CSSRuleList)=>{for(const rule of rules){if('selectorText' in rule){const r=rule as CSSStyleRule;if(r.selectorText.split(',').map(s=>s.trim()).includes(sourceSelector)&&nodes.some(n=>n.matches(r.selectorText)))matched=true}else if('cssRules' in rule)walk((rule as CSSGroupingRule).cssRules)}};walk(sheet.cssRules)}catch{}}if(!matched)throw Error('DIRECTION_EVIDENCE_SOURCE_TARGET_MISMATCH')}
        return {route:url.pathname+url.search,pageDirection:getComputedStyle(document.documentElement).direction,targets:nodes.map(node=>{const el=node as HTMLElement,style=getComputedStyle(el),r=el.getBoundingClientRect(),text=el.textContent||'',html=el.outerHTML;if(text.length>2000||html.length>10000)throw Error('DIRECTION_EVIDENCE_TARGET_TOO_LARGE');if(r.width<=0||r.height<=0||style.display==='none'||style.visibility==='hidden')throw Error('DIRECTION_EVIDENCE_HIDDEN_TARGET');if(style.writingMode!=='horizontal-tb')throw Error('DIRECTION_EVIDENCE_WRITING_MODE_UNSUPPORTED');if(icon&&(el.matches(':dir(rtl)')!==(style.direction==='rtl')))throw Error('DIRECTION_EVIDENCE_CSS_HTML_DIRECTION_MISMATCH');return {key:el.id||el.getAttribute('data-id')||el.getAttribute('data-testid')||null,text,html,direction:style.direction,writingMode:style.writingMode,computed:['margin-left','margin-right','padding-left','padding-right','left','right','text-align','transform','scale','border-left-width','border-right-width','border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius','flex-direction','box-shadow'].map(p=>style.getPropertyValue(p)),rect:[r.x,r.y,r.width,r.height],inputs:[...el.querySelectorAll('input,textarea,select')].map(x=>({value:(x as HTMLInputElement).value,checked:(x as HTMLInputElement).checked}))}})};
       },{selector:mapping.selector,expectedUrl:expected,sourceSelector:mapping.sourceSelector||'',path:entry.finding.path,icon:entry.finding.ruleId==='RTL.ICON.PROGRESSION'});
       });
       if(errors.length)throw Error('DIRECTION_EVIDENCE_PAGE_ERROR');
       values.push({role,sourceHash:descriptor.sourceHash,projectRoot:descriptor.projectRoot,runtimeSessionId:descriptor.runtimeSessionId,state});
      }finally{await page.close()}
     }
     const rechecked=await contextualPreview(root,query,w);
     if(!rechecked.original?.available||!rechecked.candidate?.available||!('sourceHash' in rechecked.original)||!('sourceHash' in rechecked.candidate)||rechecked.original.sourceHash!==values[0].sourceHash||rechecked.candidate.sourceHash!==values[1].sourceHash||rechecked.original.runtimeSessionId!==values[0].runtimeSessionId||rechecked.candidate.runtimeSessionId!==values[1].runtimeSessionId)throw Error('DIRECTION_EVIDENCE_RUNTIME_IDENTITY_CHANGED');
     const [before,after]=values;
     if(before.state.targets.length!==after.state.targets.length||before.state.targets.some((t,i)=>t.direction!==after.state.targets[i].direction||t.writingMode!==after.state.targets[i].writingMode||t.text!==after.state.targets[i].text||t.key!==after.state.targets[i].key))throw Error('DIRECTION_EVIDENCE_TARGET_MISMATCH');
     const keys=before.state.targets.map(t=>t.key);if(keys.length>1&&(keys.some(k=>!k)||new Set(keys).size!==keys.length))throw Error('DIRECTION_EVIDENCE_AMBIGUOUS_TARGETS');
     const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
     // Do not persist application text, DOM or form values in the workflow record.
     const bounded=values.map(v=>({...v,state:{...v.state,targets:v.state.targets.map(t=>({keyHash:hash(t.key),textHash:hash(t.text),htmlHash:hash(t.html),direction:t.direction,writingMode:t.writingMode,computed:t.computed,rect:t.rect,inputsHash:hash(t.inputs)}))}}));
     records.push({findingId:entry.finding.id,patchHash:hash(entry.patch),application:route.application,routeId:route.id,selector:mapping.selector,sourceSelector:mapping.sourceSelector||null,mode,viewport:{width:1280,height:800},values:bounded});
    }
   }
  }
 }finally{await browser.close()}
 return {version:1,inputDigest:w.inputDigest,policyDigest:w.policyDigest,configurationDigest:config.digest,sessionId:w.session.id,records};
}
