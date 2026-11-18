/** Installed only by the generated local Vite preview config, before the real app entry. */
export const contextualBridgeSource = String.raw`
function installContextPreview(config){
  if(!config.bindings.length)return;
  const parent=window.parent,identity=config.identity,dashboardOrigin=config.dashboardOrigin;
  const dataId=parent!==window&&/^rtl-preview:[a-f0-9-]{36}$/.test(window.name)?window.name.slice(12):null;
  const storageKey=config.dataAdapter!=='none'&&dataId?'rtl-analyzer-preview:atlas-seed-v1:'+dataId:null;
  window.__rtlPreviewStorageKey=storageKey;
  let releaseData;window.__rtlPreviewDataReady=storageKey?new Promise(resolve=>releaseData=resolve):Promise.resolve();
  let initialized=!storageKey,active=null,preparing=false,lastScroll='',layer=null,lastFingerprint='',lastBoxes='';
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const visible=node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
  const select=(selector)=>{try{return [...document.querySelectorAll(selector)].filter(n=>!n.closest('[data-rtl-context-overlay]')).slice(0,500)}catch{return []}};
  function validSeed(text){try{const rows=JSON.parse(text);return text.length<100000&&Array.isArray(rows)&&rows.length<=200&&rows.every(row=>row&&typeof row.id==='string'&&row.id.length<100&&typeof row.customerId==='string'&&Array.isArray(row.items)&&row.items.length<100)}catch{return false}}
  async function fingerprint(text){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('')}
  function resolveData(request){
    if(initialized)return true;if(!Array.isArray(window.__rtlPreviewSeedInvoices))return false;
    const existing=localStorage.getItem(storageKey),seed=request.seedData||JSON.stringify(window.__rtlPreviewSeedInvoices);
    if(!validSeed(seed)||existing&&!validSeed(existing))return false;
    if(identity.role==='candidate'&&!request.seedData)return false;
    if(!existing)localStorage.setItem(storageKey,seed);
    initialized=true;releaseData();return true;
  }
  function routeMatches(route,request){if(location.pathname!==route.path)return false;if(!route.urls)return true;if(!['ltr','rtl'].includes(request.mode))return false;const expected=new URL(route.urls[request.mode],location.origin),actual=new URL(location.href);return [...expected.searchParams].every(([key,value])=>actual.searchParams.get(key)===value);}
  function inputValue(input,value){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}
  async function until(fn){for(let i=0;i<70;i++){const result=fn();if(result)return result;await wait(40)}return null}
  async function openCustomerMenu(){const combo=document.querySelector('.form-grid [role="combobox"]');if(!combo)return;combo.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}));await until(()=>document.querySelector('[role="listbox"]'))}
  async function prepare(route,mapping){
    if(['customer-menu','invoice-confirm'].includes(route.prepare))await until(()=>document.querySelector('.form-grid [role="combobox"]'));
    if(route.prepare==='customer-dialog')await until(()=>document.querySelector('.customer-card button'));
    if(route.prepare==='sidebar')await until(()=>document.querySelector('aside'));
    if(route.prepare==='sidebar'){
      const aside=document.querySelector('aside');if(aside&&aside.getBoundingClientRect().right<=1||aside&&aside.getBoundingClientRect().left>=innerWidth){document.querySelector('.mobile-menu')?.click();await wait(100)}
    }
    if(route.prepare==='customer-dialog'&&!document.querySelector('.MuiDialogContent-root')){document.querySelector('.customer-card button')?.click();await until(()=>document.querySelector('.MuiDialogContent-root'))}
    if(route.prepare==='customer-menu'&&!document.querySelector('[role="listbox"]'))await openCustomerMenu();
    if(route.prepare==='invoice-confirm'&&!document.querySelector('.MuiDialogContent-root')){
      const combo=document.querySelector('.form-grid [role="combobox"]');
      if(combo&&!combo.textContent.trim().replace(/\u200b/g,'')){await openCustomerMenu();document.querySelector('[role="option"]')?.click();await wait(60)}
      const inputs=[...document.querySelectorAll('.line-item input')];if(inputs[0]&&!inputs[0].value){inputValue(inputs[0],'RTL preview scenario');await wait(80)}if(inputs[2]&&!(Number(inputs[2].value)>0))inputValue(inputs[2],'125');
      await wait(60);document.querySelector('form button[type="submit"]')?.click();await until(()=>document.querySelector('.MuiDialogContent-root'));
    }
  }
  let cssEpoch=0,cssSignature='',cssCache=new WeakMap();
  const invalidateCss=()=>cssEpoch++;
  new MutationObserver(records=>{if(records.some(record=>{const node=record.target.nodeType===1?record.target:record.target.parentElement;return !node?.closest('[data-rtl-context-overlay]')}))invalidateCss()}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
  for(const type of ['pointerover','pointerout','focusin','focusout','input','change','click'])document.addEventListener(type,invalidateCss,true);
  window.addEventListener('hashchange',invalidateCss);window.addEventListener('resize',invalidateCss);
  function specificity(selector){const clean=selector.replace(/:where\([^)]*\)/g,'').replace(/::[\w-]+/g,'').replace(/:(is|not|has)\(/g,'(');return [(clean.match(/#[\w-]+/g)||[]).length,(clean.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g)||[]).length,(clean.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|:[\w-]+/g,'').match(/(?:^|[\s>+~(])([a-z][\w-]*)/gi)||[]).length]}
  function styleRules(){const out=[];let order=0;function walk(rules,owner,conditions,enabled){for(const rule of rules){if(rule.selectorText&&rule.style)out.push({rule,owner,conditions,enabled,order:order++});else if(rule.cssRules){let active=enabled;const condition=rule.conditionText||'';if(rule.constructor.name==='CSSMediaRule')active=active&&matchMedia(condition).matches;else if(rule.constructor.name==='CSSSupportsRule')active=active&&CSS.supports(condition);walk(rule.cssRules,owner,condition?[...conditions,condition]:conditions,active)}}}for(const sheet of document.styleSheets){try{walk(sheet.cssRules,sheet.ownerNode,[],!sheet.disabled&&(!sheet.media?.mediaText||matchMedia(sheet.media.mediaText).matches))}catch{}}return out}
  function cssResult(node,css,finding,rules){
    const key=[cssEpoch,finding.id,css.property,document.documentElement.dir,innerWidth,innerHeight].join('|'),cached=cssCache.get(node);
    if(cached?.key===key&&getComputedStyle(node).getPropertyValue(cached.result.resolvedProperty)===cached.result.computedValue)return cached.result;
    let property=css.property;const opposite={'margin-left':'margin-right','margin-right':'margin-left','right':'left','left':'right'};
    if(css.inline&&!node.style.getPropertyValue(property)&&document.documentElement.dir==='rtl'&&opposite[property]&&rules.some(r=>r.enabled&&r.rule.style.getPropertyValue(opposite[property])===css.value&&safeMatches(node,r.rule.selectorText)))property=opposite[property];
    const applicable=[],sources=[];
    for(const entry of rules){const {rule}=entry;if(!safeMatches(node,rule.selectorText))continue;const value=rule.style.getPropertyValue(property);if(!value)continue;const spec=rule.selectorText.split(',').filter(s=>safeMatches(node,s)).map(specificity).sort(compare).at(-1)||[0,0,0];const source=css.selector?entry.owner?.getAttribute('data-vite-dev-id')?.replaceAll('\\','/').includes('/'+finding.path)&&rule.selectorText.split(',').map(s=>s.trim()).includes(css.selector):value.replace(/\s/g,'')===css.value.replace(/\s/g,'');
      const candidate={...entry,value,source,rank:[rule.style.getPropertyPriority(property)==='important'?1:0,0,...spec,entry.order]};if(source)sources.push(candidate);if(entry.enabled)applicable.push(candidate);
    }
    if(node.style.getPropertyValue(property)){const candidate={value:node.style.getPropertyValue(property),source:!!css.inline,conditions:[],enabled:true,rank:[node.style.getPropertyPriority(property)==='important'?1:0,1,0,0,0,1e9]};applicable.push(candidate);if(candidate.source)sources.push(candidate)}
    const winner=applicable.sort((a,b)=>compare(a.rank,b.rank)).at(-1),conditionActive=(!css.media||matchMedia(css.media).matches)&&(!css.rtlOnly||document.documentElement.dir==='rtl'&&!node.classList.contains('is-open'));
    const result={sourceProperty:css.property,resolvedProperty:property,declaredValue:css.value,computedValue:getComputedStyle(node).getPropertyValue(property),selectorMatched:true,conditionActive,contribution:!conditionActive?'inactive':winner?.source?'contributing':sources.some(s=>s.enabled)?'overridden':'unresolved-cascade',winner:winner?{value:winner.value,selector:winner.rule?.selectorText||'style attribute',conditions:winner.conditions}:null,limitation:'CSSOM cascade attribution for these example rules (normal/important, specificity, order, media/supports, inline and generated sx); no universal layered/shadow stylesheet analysis. A contribution is not an RTL-defect verdict.'};cssCache.set(node,{key,result});return result;
  }
  function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const delta=(a[i]||0)-(b[i]||0);if(delta)return delta}return 0}
  function safeMatches(node,selector){try{return node.matches(selector)}catch{return false}}
  function boxes(nodes,instance){const chosen=instance<0?nodes:nodes.slice(instance,instance+1),signature=JSON.stringify([innerWidth,innerHeight,chosen.map(node=>{const r=node.getBoundingClientRect();return [nodes.indexOf(node),visible(node),r.x,r.y,r.width,r.height]})]);if(layer&&signature===lastBoxes)return;lastBoxes=signature;if(!layer){layer=document.createElement('div');layer.dataset.rtlContextOverlay='true';Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'2147483647',overflow:'hidden'});document.body.append(layer)}const selected=instance<0?nodes:nodes.slice(instance,instance+1);layer.replaceChildren();for(const node of selected){if(!visible(node))continue;const r=node.getBoundingClientRect(),index=nodes.indexOf(node),box=document.createElement('div');box.className='rtl-context-highlight';box.dataset.targetIndex=String(index);const outside=r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight;Object.assign(box.style,{position:'absolute',left:Math.max(1,r.left)+'px',top:Math.max(1,r.top)+'px',width:Math.max(2,Math.min(r.width,innerWidth-Math.max(1,r.left)-2))+'px',height:Math.max(2,Math.min(r.height,innerHeight-Math.max(1,r.top)-2))+'px',outline:'3px solid #e26b00',outlineOffset:'-2px',background:'rgba(255,163,40,.07)',boxSizing:'border-box'});if(outside){box.style.left='4px';box.style.top='4px';box.style.width='230px';box.style.height='30px';box.textContent='Target '+(index+1)+' is outside the viewport';box.style.background='#fff4db';box.style.color='#6e3500'}layer.append(box)}}
  document.addEventListener('click',event=>{const anchor=event.target.closest?.('a[href]');if(!anchor||!active)return;const url=new URL(anchor.href,location.href);if(['localhost','127.0.0.1'].includes(url.hostname)&&['4200','4201'].includes(url.port)&&url.origin!==location.origin){event.preventDefault();event.stopPropagation();parent.postMessage({type:'rtl-context-navigation',version:2,nonce:active.request.nonce,role:identity.role,application:identity.application,projectRoot:identity.projectRoot,sessionId:active.request.sessionId,runtimeSessionId:identity.sessionId,findingId:active.request.findingId,sourcePath:active.request.sourcePath,sourceSha256:config.sourceHashes[active.request.sourcePath],routeId:active.request.routeId,nextApplication:url.port==='4201'?'procurement':'invoicing'},dashboardOrigin)}},true);
  let paintPending=false;const repaint=()=>{if(paintPending||!active)return;paintPending=true;requestAnimationFrame(()=>{paintPending=false;if(active)boxes(select(active.mapping.selector),active.instance)})};
  window.addEventListener('scroll',repaint,true);window.addEventListener('resize',repaint);
  window.addEventListener('message',async event=>{
    const request=event.data;
    if(event.origin!==dashboardOrigin||event.source!==parent||!request||request.type!=='rtl-context-probe'||request.version!==2||typeof request.nonce!=='string'||request.nonce.length>100||request.role!==identity.role||request.application!==identity.application||request.runtimeSessionId!==identity.sessionId||request.projectRoot!==identity.projectRoot||typeof request.sessionId!=='string'||request.sessionId.length>100||typeof request.sourceSha256!=='string'||request.sourceSha256!==config.sourceHashes[request.sourcePath]||!Number.isInteger(request.instance)||request.instance< -1||request.instance>500)return;
    const binding=config.bindings.find(b=>b.finding.id===request.findingId&&b.finding.path===request.sourcePath);if(!binding)return;
    const route=binding.mapping.routes.find(r=>r.id===request.routeId&&r.application===identity.application);if(!route)return;
    if(!resolveData(request))return;
    const key=[request.nonce,request.findingId,request.routeId].join('|');
    if(!active||active.key!==key){active={key,mapping:binding.mapping,instance:request.instance,request};lastScroll='';preparing=true;try{await until(()=>document.querySelector(config.readySelector||'#root > *'));if(routeMatches(route,request))await prepare(route,binding.mapping)}finally{if(active?.key===key)preparing=false}}
    if(active?.key!==key)return;active.instance=request.instance;active.request=request;
    if(request.command==='reveal-navigation'){document.querySelector('.mobile-menu')?.click();await wait(80)}
    if(request.command==='reset-data'&&storageKey&&validSeed(request.seedData)){localStorage.setItem(storageKey,request.seedData);const next=new URL(route.path,location.origin);for(const key of ['demo','lang']){const value=new URLSearchParams(location.search).get(key);if(value)next.searchParams.set(key,value)}location.replace(next.href);return}
    const nodes=routeMatches(route,request)?select(binding.mapping.selector):[];
    if(request.command==='highlight')lastScroll='';
    const scrollKey=key+':'+request.instance+':'+nodes.length;if(nodes.length&&lastScroll!==scrollKey){const node=nodes[Math.max(0,request.instance)]||nodes[0];if(visible(node))node.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});lastScroll=scrollKey}
    boxes(nodes,request.instance);
    const rules=binding.mapping.css?styleRules():[];
    if(binding.mapping.css){const signature=rules.map(entry=>[entry.enabled,entry.conditions.join(' '),entry.rule.cssText].join('|')).join('\n');if(signature!==cssSignature){cssSignature=signature;cssEpoch++;cssCache=new WeakMap()}}
    const sourceRules=binding.mapping.configured&&binding.mapping.sourceSelector?styleRules().filter(entry=>entry.owner?.getAttribute('data-vite-dev-id')?.replaceAll('\\','/').endsWith('/'+binding.finding.path)&&entry.rule.selectorText.split(',').map(s=>s.trim()).includes(binding.mapping.sourceSelector)):[];
    const sourceStatus=!binding.mapping.configured||!binding.mapping.sourceSelector?'not-required':!sourceRules.length?'source-not-observed':!nodes.length?'target-not-found':nodes.some(node=>sourceRules.some(entry=>safeMatches(node,entry.rule.selectorText)))?'source-rule-matched':'target-source-mismatch';
    const targets=nodes.map((node,index)=>{const r=node.getBoundingClientRect();return {index,label:(binding.mapping.kind==='document'?'Whole document · '+document.title:node.textContent||node.getAttribute('aria-label')||node.tagName).trim().replace(/\s+/g,' ').slice(0,100),rendered:visible(node),inViewport:r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight,rect:{x:r.x,y:r.y,width:r.width,height:r.height},...(binding.mapping.css?{css:cssResult(node,binding.mapping.css,binding.finding,rules)}:{})}});
    const seedData=storageKey?localStorage.getItem(storageKey):null,defaultSeedData=JSON.stringify(window.__rtlPreviewSeedInvoices||[]);
    const dataFingerprint=seedData?await fingerprint(seedData):null;if(active?.key!==key)return;lastFingerprint=dataFingerprint;
    const routeReady=!!document.querySelector(config.readySelector||'#root > *');
    parent.postMessage({type:'rtl-context-status',version:2,nonce:request.nonce,role:identity.role,application:identity.application,projectRoot:identity.projectRoot,sessionId:request.sessionId,runtimeSessionId:identity.sessionId,findingId:request.findingId,sourcePath:request.sourcePath,sourceSha256:config.sourceHashes[request.sourcePath],routeId:request.routeId,route:location.pathname,dir:document.documentElement.dir,routeReady,sourceStatus,targetStatus:preparing?'preparing':!routeReady?'route-not-ready':!routeMatches(route,request)?'navigated':sourceStatus==='source-not-observed'?'source-not-loaded':sourceStatus==='target-source-mismatch'?'target-mismatch':targets.some(t=>t.rendered)?binding.mapping.kind==='document'?'document':'verified':targets.length?'hidden':binding.mapping.configured?'missing-target':'unresolved',targets,dataFingerprint,seedData,defaultSeedData,dataScope:storageKey,fixtureData:config.dataAdapter==='none'?'application-data':'atlas-seed-v1'},dashboardOrigin);
  });
}
`;
