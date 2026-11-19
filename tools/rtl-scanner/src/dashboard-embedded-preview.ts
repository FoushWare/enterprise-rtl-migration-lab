import { contextualPreviewClientSource } from './dashboard-contextual-preview.js';
/** Runs inside the existing dashboard closure, using its verified analysis and selection. */
export const embeddedPreviewClientSource = String.raw`
const embeddedReview=(()=>{
  const records=new Map();let selected=null,view=null;
  const key=f=>[d.inputDigest,d.policyDigest,f.id,f.path].join('|');
  const request=async(path,options)=>{let response;try{response=await fetch(previewOrigin+path,options)}catch{throw Error('COMPANION_UNAVAILABLE')}const body=await response.json();if(!response.ok)throw Error(body.error||'PREVIEW_REQUEST_FAILED');return body};
  const live=(record,node)=>selected===record.key&&node.isConnected;
  const status=(record,text)=>{if(selected!==record.key)return;const n=document.querySelector('.analysis-status');if(n)n.textContent=text};
  const workspaceLayout={position:'fixed',inset:'0',width:'100vw',height:'100vh','max-width':'none','max-height':'none','z-index':'10000',overflow:'hidden',display:'flex','flex-direction':'column','box-sizing':'border-box',margin:'0',padding:'8px','border-radius':'0',gap:'8px',background:'#0e1a2d',color:'#e9f0ff',font:'14px/1.4 Inter,ui-sans-serif,system-ui,sans-serif',transform:'none',animation:'none',transition:'none'};
  const setText=(node,value)=>{if(node.textContent!==value)node.textContent=value};
  const originalOrigins=new Set(['http://127.0.0.1:4200','http://127.0.0.1:4201']);
  const originAllowed=(url,role)=>{const u=new URL(url);return u.protocol==='http:'&&u.hostname==='127.0.0.1'&&(role==='original'?originalOrigins.has(u.origin):Number(u.port)>=4202&&Number(u.port)<=4212)};
  function closeWorkspace(current=view,restore=true){
    if(!current?.expanded)return;const saved=current.expanded,surface=current.component;current.expanded=null;
    if(saved.portal){
      if(saved.host.isConnected){for(const child of [...surface.childNodes])saved.host.moveBefore(child,null);saved.host.className=saved.hostClass;saved.host.hidden=saved.hostHidden}
      surface.remove();current.component=saved.host;
    }else{
      surface.classList.remove('embedded-expanded');surface.removeAttribute('role');surface.removeAttribute('aria-modal');surface.removeAttribute('aria-label');delete surface.dataset.previewView;
      if(saved.style===null)surface.removeAttribute('style');else surface.setAttribute('style',saved.style);
    }
    delete current.component.dataset.previewView;saved.placeholder.remove();for(const [node,inert] of saved.background)node.inert=inert;
    document.documentElement.style.overflow=saved.htmlOverflow;document.body.style.overflow=saved.bodyOverflow;
    current.expand.textContent='Expand';current.items.forEach(item=>resize(item,current.record));syncRoute(current);
    for(const [node,top,left] of saved.scroll)node.scrollTo(left,top);
    if(restore&&saved.opener?.isConnected)saved.opener.focus({preventScroll:true});
  }
  function setView(current,mode){current.component.dataset.previewView=mode;current.workspace.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===mode)));current.items.forEach(item=>resize(item,current.record));syncRoute(current)}
  function openWorkspace(current,mode,opener){
    if(!current.expanded){
      const host=current.component,placeholder=el('div');placeholder.style.height=host.getBoundingClientRect().height+'px';placeholder.style.margin=getComputedStyle(host).margin;host.before(placeholder);
      const background=[],scroll=[];for(let node=host;node.parentElement;node=node.parentElement){for(const sibling of node.parentElement.children)if(sibling!==node&&sibling!==placeholder&&sibling!==document.head){background.push([sibling,sibling.inert]);sibling.inert=true}scroll.push([node.parentElement,node.parentElement.scrollTop,node.parentElement.scrollLeft])}
      const saved={opener,placeholder,background,scroll,host,hostClass:host.className,hostHidden:host.hidden,style:host.getAttribute('style'),portal:typeof host.moveBefore==='function',htmlOverflow:document.documentElement.style.overflow,bodyOverflow:document.body.style.overflow};current.expanded=saved;
      if(saved.portal){
        // moveBefore preserves live iframe browsing contexts; ordinary reparenting must not be used.
        const portal=document.createElement('div');portal.className=host.className;for(const [property,value] of Object.entries(workspaceLayout))portal.style.setProperty(property,value,'important');portal.classList.add('embedded-expanded');document.body.append(portal);
        host.classList.remove('component-review');host.hidden=true;
        for(const child of [...host.childNodes])portal.moveBefore(child,null);
        current.component=portal;
      }
      const surface=current.component;for(const [property,value] of Object.entries(workspaceLayout))surface.style.setProperty(property,value,'important');
      document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';surface.classList.add('embedded-expanded');surface.setAttribute('role','dialog');surface.setAttribute('aria-modal','true');surface.setAttribute('aria-label','Live application preview');current.expand.textContent='Collapse';
    }
    setView(current,mode);current.workspace.querySelector('[data-view="'+mode+'"]').focus({preventScroll:true});
    if(current.record.contextual)requestAnimationFrame(()=>{if(current.expanded&&live(current.record,current.component))current.items.forEach(item=>contextProbe(item,current.record,current.record.finding,'highlight'))});
  }
  function renderPreviewBadges(group,record,role){const values=role==='original'?[record.historical?'Current source':'Original']:record.historical?['No candidate']:candidateStatus(record).split(' · ').map(value=>value.replace('validation: Not run','Validation: Not run').replace(/^Not run$/,'Validation: Not run'));group.replaceChildren(...values.map(value=>{const badge=el('span',value,'preview-badge');badge.dataset.status=value;return badge}))}
  function candidateStatus(record){if(record.preparation?.state==='failed')return 'Preview preparation failed · validation: '+(record.validation||'Not run');if(['waiting','preparing'].includes(record.preparation?.state))return 'Preparing isolated preview · '+(record.decision||'Pending')+' · validation: '+(record.validation||'Not run');if(record.preparation?.state==='unsupported')return 'Preview unavailable · validation: '+(record.validation||'Not run');if(!record.session)return 'No candidate prepared · validation: Not run';return 'Candidate ready · '+(record.decision||'Pending')+' · '+(record.validation||'Not run')}
  function syncControls(current){
    current.component.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.direction===current.record.mode)));
    current.workspace.querySelector('[aria-label="Preview viewport"]').value=String(current.record.viewport);for(const [mode,label] of [['before','Current source'],['after','No candidate'],['split','Split']])current.workspace.querySelector('[data-view="'+mode+'"]').textContent=current.record.historical?label:mode[0].toUpperCase()+mode.slice(1);
    current.items[0].panel.querySelector('.preview-identity').textContent='Before';current.items[1].panel.querySelector('.preview-identity').textContent='After';current.items.forEach(item=>renderPreviewBadges(item.panel.querySelector('.preview-status'),current.record,item.role));
  }
  function syncRoute(current){
    if(current.record.contextual){const route=current.record.contextInfo?.route,verified=current.items.some(item=>['verified','document'].includes(item.state.dataset.contextStatus));const actual=current.items.find(item=>item.currentRoute)?.currentRoute;const label=route?'Route: '+(current.record.historical?'Current source ':'')+(actual||route.path)+' · '+(verified?'Verified target':'Configured · target unverified'):'Route: Unverified · no mapping';setText(current.workspace.querySelector('.preview-current-route'),label);const compact=current.component.querySelector('.component-toolbar > span');if(compact)setText(compact,label);return}
    const route=current.items.find(item=>item.currentRoute)?.currentRoute;const label='Route: '+(route||'Unverified');setText(current.workspace.querySelector('.preview-current-route'),label);const compact=current.component.querySelector('.component-toolbar > span');if(compact)setText(compact,label);
  }
  function removeView(){if(view){closeWorkspace(view);clearInterval(view.poll);for(const item of view.items){clearTimeout(item.timeout);item.observer.disconnect()}view=null}}
  function choose(id){selected=null;removeView();document.querySelectorAll('.component-review iframe').forEach(frame=>frame.remove())}
  function makeView(record,f){
    const component=document.querySelector('.component-review');if(!component)return null;
    if(view?.component===component&&view.record===record){syncControls(view);return view}
    removeView();component.querySelectorAll('.preview-diagnostic').forEach(node=>node.remove());component.querySelector('.preview-workspace-toolbar')?.remove();component.querySelectorAll('.context-preview-controls,.preview-context-summary').forEach(node=>node.remove());
    const helper=component.querySelector('.component-helper');if(helper&&!helper.closest('.preview-diagnostics')){const diagnostics=el('details','','preview-diagnostics');diagnostics.append(el('summary','Preview diagnostics'));helper.before(diagnostics);diagnostics.append(helper);helper.textContent='Live owning-route preview · original / isolated candidate. Review and technical validation are separate.';}
    const result={record,component,items:[],poll:null};
    for(const [role,selector] of [['original','.component-before'],['candidate','.component-after']]){
      const panel=component.querySelector(selector);panel.querySelectorAll('p,.embedded-viewport').forEach(n=>n.remove());
      const heading=panel.querySelector('h3');heading.replaceChildren(el('span',role==='original'?'Before':'After','preview-identity'),el('span','','preview-status'));renderPreviewBadges(heading.querySelector('.preview-status'),record,role);
      const expandFrame=el('button','⛶','preview-frame-expand');expandFrame.type='button';expandFrame.setAttribute('aria-label',role==='original'?'Expand original preview':'Expand candidate preview');expandFrame.title=expandFrame.getAttribute('aria-label');expandFrame.onclick=()=>openWorkspace(result,role==='original'?'before':'after',expandFrame);heading.append(expandFrame);
      const state=el('p',role==='original'?'Checking original application…':'Apply & Preview to load the isolated candidate.','embedded-state');state.setAttribute('role','status');state.dataset.state='idle';
      const box=el('div','','embedded-viewport');panel.append(state,box);
      const diagnostic=el('p','','preview-diagnostic');diagnostic.setAttribute('aria-label',role==='original'?'Before preview evidence':'After preview evidence');component.querySelector('.preview-diagnostics')?.append(diagnostic);const item={role,panel,state,box,diagnostic,frame:null,nonce:null,url:null,timeout:null,ready:null};
      item.observer=new ResizeObserver(()=>resize(item,record));item.observer.observe(box);result.items.push(item);
    }
    const toolbar=component.querySelector('.component-toolbar');
    const direction=mode=>{if(record.mode===mode&&!result.items.some(item=>item.contextReport&&item.contextReport.dir!==mode))return;record.mode=mode;syncControls(result);routes(record,f,result)};
    for(const mode of ['ltr','rtl']){const button=[...toolbar.querySelectorAll('button')].find(b=>b.textContent===mode.toUpperCase());if(button){button.disabled=false;button.dataset.direction=mode;button.onclick=()=>direction(mode)}}
    const viewport=[...toolbar.querySelectorAll('button')].find(b=>['Desktop','Tablet','Mobile'].includes(b.textContent));
    const setViewport=value=>{record.viewport=value;if(viewport)viewport.textContent=['Desktop','Tablet','Mobile'][value];syncControls(result);result.items.forEach(item=>resize(item,record))};
    if(viewport){viewport.disabled=false;viewport.textContent=['Desktop','Tablet','Mobile'][record.viewport];viewport.onclick=()=>setViewport((record.viewport+1)%3)}
    const expand=[...toolbar.querySelectorAll('button')].find(b=>['Expand','Collapse'].includes(b.textContent));result.expand=expand;if(expand){expand.disabled=false;expand.onclick=()=>result.expanded?closeWorkspace(result):openWorkspace(result,'split',expand)}
    const workspace=el('div','','preview-workspace-toolbar');result.workspace=workspace;
    const views=el('div','','preview-view-options');views.setAttribute('role','group');views.setAttribute('aria-label','Preview view');
    for(const mode of ['before','after','split']){const b=el('button',mode[0].toUpperCase()+mode.slice(1));b.dataset.view=mode;b.onclick=()=>setView(result,mode);views.append(b)}
    const route=el('span','Route: Unverified','preview-current-route');
    const directions=el('div','','preview-direction-options');directions.setAttribute('role','group');directions.setAttribute('aria-label','Preview direction');
    for(const mode of ['ltr','rtl']){const b=el('button',mode.toUpperCase());b.dataset.direction=mode;b.onclick=()=>direction(mode);directions.append(b)}
    const device=document.createElement('select');device.setAttribute('aria-label','Preview viewport');['Desktop / Auto','Tablet · 768 × 850','Mobile · 390 × 850'].forEach((label,index)=>device.append(new Option(label,String(index))));device.onchange=()=>setViewport(Number(device.value));
    const close=el('button','Close','preview-workspace-close');close.onclick=()=>closeWorkspace(result);workspace.append(views,route,directions,device,close);component.prepend(workspace);syncControls(result);
    result.poll=setInterval(()=>{if(!live(record,component))return;for(const item of result.items)probe(item,record,f)},250);
    view=result;return result;
  }
  function resize(item,record){if(!item.frame)return;const width=[1280,768,390][record.viewport],height=850,expanded=item.panel.closest('.embedded-expanded');if(expanded){Object.assign(item.frame.style,{width:record.viewport?width+'px':'100%',height:record.viewport?height+'px':'100%',transform:'none'});item.box.style.height='';item.box.dataset.viewport=record.viewport?String(width):'auto';return}const scale=Math.min(1,(item.box.clientWidth||300)/width);Object.assign(item.frame.style,{width:width+'px',height:height+'px',transform:'scale('+scale+')',transformOrigin:'top left'});item.box.style.height=Math.ceil(height*scale)+'px';item.box.dataset.viewport=String(width)}
  function probe(item,record,f){if(record.contextual)return contextProbe(item,record,f);if(!item.frame||!item.nonce)return;item.frame.contentWindow?.postMessage({type:'rtl-preview-probe',version:1,nonce:item.nonce,role:item.role,sessionId:record.session?.id||'before-only',runtimeSessionId:item.role==='original'?'original':record.session.id,findingId:f.id,sourcePath:f.path,expectedSha256:item.expectedHash,...(record.workflowId?{projectRoot:item.role==='original'?record.projectRoot:record.session.candidateRoot}:{})},new URL(item.url).origin)}
  function load(item,url,record,f,hash){
    if(!originAllowed(url,item.role))throw Error('UNAPPROVED_PREVIEW_ORIGIN');
    if(item.url===url&&item.expectedHash===hash&&item.frame&&(!record.contextual||!item.contextReport||item.contextReport.dir===record.mode)&&(item.role==='original'||item.runtimeSessionId===record.session?.id)){item.frame.dataset.sessionId=record.session?.id||'before-only';return}
    clearTimeout(item.timeout);item.ready=null;item.contextReport=null;item.lastVerifiedReport=null;item.url=url;item.currentRoute=new URL(url).pathname;item.expectedHash=hash;item.runtimeSessionId=record.session?.id;item.nonce=crypto.randomUUID();
    item.state.textContent='Loading live '+item.role+' route…';item.state.dataset.state='loading';
    const pending=()=>{clearTimeout(item.timeout);item.ready=null;item.state.dataset.state='loading';if(record.contextual)item.state.dataset.contextStatus='loading-route';item.state.textContent='Checking the live application and current contextual target…';item.timeout=setTimeout(()=>{if(live(record,item.box)&&!item.ready){item.state.textContent=item.contextReport?item.state.textContent:'Embedding blocked or local preview bridge unavailable. Retry context or restart the scoped application runtime.';item.state.dataset.state='error';if(record.contextual){if(!item.contextReport)item.state.dataset.contextStatus='runtime-unavailable';updateCandidateAction(view)}}},12000)};
    const frame=document.createElement('iframe');frame.title=item.role==='original'?(record.historical?'Current source: application route':'Before: original application route'):'After: isolated candidate application route';frame.dataset.findingId=f.id;frame.dataset.sessionId=record.session?.id||'before-only';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms');if(record.contextual)frame.name='rtl-preview:'+record.dataId;frame.src=url;item.frame=frame;item.box.replaceChildren(frame);resize(item,record);frame.onload=()=>{pending();probe(item,record,f)};
    pending();
  }
  ${contextualPreviewClientSource}
  async function routes(record,f,current){
    if(record.contextual)return contextRoutes(record,f,current);
    if(!current||!live(record,current.component))return;
    const token=(record.routeToken||0)+1;record.routeToken=token;
    try{
      const query=new URLSearchParams({mode:record.mode,...(record.session&&record.patched?{session:record.session.id,findingId:f.id}:{})});
      const info=await request(record.workflowId?'/review/workflows/'+record.workflowId+'/preview?'+new URLSearchParams({mode:record.mode,findingId:f.id}):'/mappings/'+encodeURIComponent(f.previewMappingId)+'/preview?'+query);
      if(!live(record,current.component)||record.routeToken!==token)return;
      const before=current.items[0],after=current.items[1];
      if(info.originalAvailable)load(before,info.originalUrl,record,f,info.originalSourceSha256);else{before.box.replaceChildren();before.frame=null;before.state.textContent='Original application unavailable. Start the local original preview runtime.';before.state.dataset.state='error'}
      if(record.runtime?.runtime?.status==='healthy'){
        if(info.candidateSessionId!==record.session.id||info.findingId!==f.id||!info.candidateOrigin)throw Error('PREVIEW_SESSION_IDENTITY_MISMATCH');
        load(after,info.url,record,f,info.candidateSourceSha256);
        // Secondary external links always point to this exact candidate and direction.
        const routeButtons=current.component.querySelectorAll('.route-actions button');routeButtons.forEach((b,index)=>{b.disabled=false;b.onclick=async()=>{try{const route=await request(record.workflowId?'/review/workflows/'+record.workflowId+'/preview?'+new URLSearchParams({mode:index===0?'ltr':'rtl',findingId:f.id}):'/mappings/'+encodeURIComponent(f.previewMappingId)+'/preview?'+new URLSearchParams({mode:index===0?'ltr':'rtl',session:record.session.id,findingId:f.id}));if(live(record,current.component)&&route.candidateSessionId===record.session.id&&originAllowed(route.url,'candidate'))window.open(route.url,'_blank','noopener,noreferrer')}catch(error){status(record,error.message)}}});
      }
    }catch(error){if(live(record,current.component)){for(const item of current.items){item.state.textContent=error.message==='COMPANION_UNAVAILABLE'?'Companion unavailable. Retry connection.':'Preview route unavailable: '+error.message;item.state.dataset.state='error'}}}
  }
  window.addEventListener('message',event=>{
    if(!view||view.record.contextual||selected!==view.record.key)return;const record=view.record,p=event.data;
    for(const item of view.items){
      if(!item.frame||event.source!==item.frame.contentWindow||event.origin!==new URL(item.url).origin||!p||p.type!=='rtl-preview-status'||p.version!==1||p.nonce!==item.nonce||p.role!==item.role||p.sessionId!==(record.session?.id||'before-only')||p.runtimeSessionId!==(item.role==='original'?'original':record.session?.id)||p.findingId!==record.finding.id||p.sourcePath!==record.finding.path||p.sourceSha256!==item.expectedHash||(record.workflowId&&p.projectRoot!==(item.role==='original'?record.projectRoot:record.session.candidateRoot))||p.dir!==record.mode||!Array.isArray(p.invoiceIds)||p.invoiceIds.length>100||p.invoiceIds.some(id=>typeof id!=='string'||id.length>100)||!Number.isInteger(p.bdiCount)||p.fixtureData!=='atlas-seed-v1')continue;
      if(typeof p.route!=='string'||p.route.length>200||!/^\/[a-zA-Z0-9/_-]*$/.test(p.route))continue;item.currentRoute=p.route;syncRoute(view);
      if(p.route!=='/invoices'){item.ready=null;clearTimeout(item.timeout);item.state.textContent='Live application · '+p.route+' · '+p.dir.toUpperCase()+' · '+(item.role==='original'?'Original':candidateStatus(record));item.state.dataset.state='navigated';continue}
      if(!p.rendered)continue;
      item.ready=p;clearTimeout(item.timeout);item.state.textContent='Ready · live route · '+p.dir.toUpperCase()+' · '+p.invoiceIds.length+' invoice rows'+(item.role==='candidate'?' · '+candidateStatus(record):'');item.state.dataset.state='ready';
    }
    const [before,after]=view.items;if(before.ready&&after.ready&&JSON.stringify(before.ready.invoiceIds)!==JSON.stringify(after.ready.invoiceIds)){for(const item of view.items){item.state.dataset.state='error';item.state.textContent='Preview data mismatch. Reload the local seed fixtures.'}}
  });
  async function apply(record,f,payload,button,current){
    if(record.busy)return;record.busy=true;button.disabled=true;
    try{
      if(!record.session){record.session=await request('/review/sessions',{method:'POST'});sessionStorage.setItem('rtl-preview:'+record.key,record.session.id)}
      if(!record.patched){const saved=await request('/review/sessions/'+record.session.id);if(saved.candidateSha256){if(saved.findingId!==f.id||saved.originalSha256!==payload.sourceSha256)throw Error('PREVIEW_SESSION_IDENTITY_MISMATCH');record.patched={candidateSha256:saved.candidateSha256}}}
      if(!record.patched){const patched=await request('/review/sessions/'+record.session.id+'/patch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload.patch)});record.patched=patched;}
      const diff=await request('/review/sessions/'+record.session.id+'/diff');if(diff.state!=='ready'||diff.candidateSessionId!==record.session.id||diff.path!==f.path||diff.after!==payload.patch.replacement)throw Error(diff.reason||'CANDIDATE_DIFF_UNAVAILABLE');record.diff=diff;
      status(record,'Verified isolated candidate created. Starting preview…');
      record.runtime=await request('/review/sessions/'+record.session.id+'/runtime/start',{method:'POST'});if(record.runtime.runtime?.status!=='healthy')throw Error(record.runtime.runtime?.error||'CANDIDATE_RUNTIME_FAILED');
      reviewSession={...record.session,...record.patched,...record.runtime};
      status(record,'Candidate preview is running. Original source remains unchanged.');
      if(live(record,button)){button.textContent='Open candidate preview';button.title='Refresh the same embedded candidate preview';await routes(record,f,current)}
    }catch(error){status(record,(error.message==='COMPANION_UNAVAILABLE'?'Companion unavailable: ':'Candidate startup failed: ')+error.message);if(live(record,button)){button.textContent='Retry candidate preview';const after=current.items[1];after.state.textContent='Candidate startup failed: '+error.message;after.state.dataset.state='error'}}
    finally{record.busy=false;if(live(record,button))button.disabled=false}
  }
  function configure(f,payload){
    const identity=key(f);selected=identity;let record=records.get(identity);if(!record){record={key:identity,mode:'ltr',viewport:0,session:null,patched:null,runtime:null,busy:false,finding:f};records.set(identity,record)}
    if(payload.workflow){record.contextual=true;const dataKey='rtl-context-data:'+d.inputDigest;record.dataId=sessionStorage.getItem(dataKey)||crypto.randomUUID();sessionStorage.setItem(dataKey,record.dataId);const w=payload.workflow;if(record.workflowId!==w.id||(record.session?.id||null)!==(w.state==='Reviewing'?w.session?.id||null:null)){if(view?.record===record)removeView();record.preparation=null;}record.workflowId=w.id;record.projectRoot=w.root;record.historical=w.state!=='Reviewing';record.workflowState=w.state;record.session=record.historical?null:w.session||null;record.entryApplied=!record.historical&&!!w.entries.find(e=>e.finding.id===f.id)?.applied;record.decision=record.historical?'Pending':w.entries.find(e=>e.finding.id===f.id)?.decision||'Pending';record.manualPrepare=payload.onApply;record.validation=record.historical?'Not run':w.validationPresentation?.status||'Not run';record.patched=!record.historical&&w.session?{candidateSha256:w.session.candidateSha256}:null;record.runtime=!record.historical&&w.session?.runtime?.status==='healthy'?{runtime:w.session.runtime}:null}
    const component=document.querySelector('.component-review'),card=document.querySelector('.decision-card');if(!component||!card)return;
    let button=card.querySelector('[data-candidate-action]')||[...card.querySelectorAll('button')].find(b=>['Apply & Preview','Prepare candidate','Open candidate preview','Retry candidate preview'].includes(b.textContent));if(!button&&!payload.workflow){button=el('button','Apply & Preview');card.append(button)}
    if(payload.onRetryPreview)record.retryPreview=payload.onRetryPreview;
    const current=makeView(record,f);
    if(!record.contextual&&!record.runtime&&current.items[1].frame){const item=current.items[1];clearTimeout(item.timeout);item.box.replaceChildren();item.frame=null;item.ready=null;item.state.textContent='Candidate runtime unavailable.';item.state.dataset.state='idle'}
    if(button&&!button.dataset.automaticPreview){button.disabled=record.busy;button.title='Apply verified patch to an isolated candidate and embed its live route';button.onclick=payload.onApply||(()=>apply(record,f,payload,button,current));if(record.runtime?.runtime?.status==='healthy'&&(!payload.workflow||capability(f)?.verified)&&(!payload.workflow||payload.workflow.entries.some(e=>e.finding.id===f.id&&e.applied)))button.textContent='Open candidate preview';}
    routes(record,f,current);
    const restored=payload.workflow||!button?null:sessionStorage.getItem('rtl-preview:'+identity);
    if(restored&&!record.session){button.disabled=true;request('/review/sessions/'+encodeURIComponent(restored)).then(info=>{if(info.source!==f.path||info.originalSha256!==payload.sourceSha256||info.findingId!==f.id||!info.candidateSha256)throw Error('STALE_PREVIEW_SESSION');record.session=info;record.patched={candidateSha256:info.candidateSha256};record.runtime=info.runtime?.status==='healthy'?{id:info.id,runtime:info.runtime,candidateOrigin:info.runtime.origin}:null;if(live(record,button)){button.textContent=record.runtime?'Open candidate preview':'Retry candidate preview';routes(record,f,current)}}).catch(()=>sessionStorage.removeItem('rtl-preview:'+identity)).finally(()=>{if(live(record,button))button.disabled=false})}
  }
  const style=el('style');style.textContent="\n.component-frame:has(.embedded-state:not([data-context-status=verified])){background:#18283e!important;border-color:#4a627f!important;color:#c8d5e7!important}.component-frame:has(.embedded-state[data-state=error]){border-color:#c15b70!important}.after-card{background:#18283e!important;border-color:#4a627f!important}.after-card pre{color:#d1deef!important}\n.embedded-viewport{position:relative;overflow:hidden;width:100%;min-height:0;background:#fff;border-radius:5px}\n.embedded-viewport iframe{display:block;border:0;max-width:none!important;background:white}\n.embedded-state{margin:5px 0!important;min-height:25px}\n.component-frame{overflow:hidden}.component-after{background:#18283e!important;border-color:#4a627f!important;color:#dce7fb!important}.component-frame h3{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.preview-identity{font-size:12px}.preview-status{display:flex;gap:4px;flex-wrap:wrap;color:#b8c9df;font-size:10px;letter-spacing:0;text-transform:none;font-weight:500;flex:1}.preview-badge{border:1px solid #4a627f;border-radius:99px;padding:2px 6px;background:#182b44}.preview-badge[data-status=Passed]{color:#6fe4b2;border-color:#398668}.preview-badge[data-status=Failed]{color:#ff99a8;border-color:#a64b5a}.preview-badge[data-status~=Limited]{color:#ffd166;border-color:#987524}.component-frame h3 .context-instance{order:3;margin-left:auto}.component-frame h3 .preview-frame-expand{order:4}.context-preview-controls .context-retry{background:transparent;border-color:transparent;color:#a9bbd3;text-decoration:underline;text-underline-offset:3px}.context-preview-controls button{background:#142944;color:#c5d0e0;border:1px solid #405775;border-radius:5px;padding:4px 6px;font-size:10px}.preview-diagnostics{margin:4px 0;color:#b9c9df;font-size:10px}.preview-diagnostics summary{cursor:pointer}.component-review .component-helper{display:block!important}\n.component-review .component-compare{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important}\n.preview-frame-expand{flex:none;min-width:28px;min-height:26px;border:1px solid currentColor;border-radius:5px;background:transparent;color:inherit;font-size:19px;cursor:pointer}\n.preview-workspace-toolbar{display:none}\n.component-review.embedded-expanded{position:fixed!important;inset:0!important;width:auto!important;height:auto!important;max-height:none!important;z-index:10000;overflow:hidden!important;background:#0e1a2d!important;padding:8px!important;margin:0!important;border-radius:0!important;display:flex!important;flex-direction:column!important;box-sizing:border-box;gap:8px}\n.embedded-expanded>:not(.preview-workspace-toolbar):not(.component-compare){display:none!important}\n.embedded-expanded .preview-workspace-toolbar{display:flex;flex:none;align-items:center;gap:12px;flex-wrap:wrap;min-height:36px;color:#dce7fb;font-size:12px}\n.preview-workspace-toolbar button,.preview-workspace-toolbar select{min-height:32px;padding:5px 11px;border:1px solid #547297;border-radius:6px;background:#142944;color:#e9f0ff;font:inherit;cursor:pointer}\n.preview-workspace-toolbar button[aria-pressed=true]{background:#6641ae;border-color:#c5a6ff;color:white}\n.preview-view-options,.preview-direction-options{display:flex;gap:4px}\n.preview-current-route{flex:1;min-width:110px;overflow-wrap:anywhere}\n.preview-workspace-close{margin-left:auto;background:#392640!important;border-color:#bc8da9!important}\n.embedded-expanded .component-compare{flex:1;min-height:0;gap:8px;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}\n.embedded-expanded .component-arrow{display:none!important}\n.embedded-expanded .component-frame{min-height:0;padding:7px;gap:3px}\n.embedded-expanded .component-frame h3{flex:none;align-items:center;margin:0!important;min-height:26px;font-size:12px!important}\n.embedded-expanded .preview-frame-expand{display:none}\n.embedded-expanded .embedded-state{flex:none;min-height:16px;font-size:10px!important;margin:0 0 3px!important}\n.embedded-expanded .embedded-viewport{flex:1;min-height:0;height:auto;overflow:auto;overscroll-behavior:contain;border-radius:3px}\n.embedded-expanded[data-preview-view=before] .component-after,.embedded-expanded[data-preview-view=after] .component-before{display:none!important}\n.embedded-expanded[data-preview-view=before] .component-compare,.embedded-expanded[data-preview-view=after] .component-compare{grid-template-columns:minmax(0,1fr)!important}\n.context-preview-controls{display:flex;align-items:center;gap:5px;flex-wrap:wrap}.context-preview-controls select,.context-instance{max-width:260px;min-width:90px;border:1px solid #547297;border-radius:5px;background:#142944;color:#e9f0ff;font-size:11px;padding:4px}.context-instance{max-width:40%;min-width:70px}.preview-context-summary{color:#c8d4eb;font-size:11px;flex:1;min-width:150px}.preview-workspace-toolbar .context-preview-controls .context-retry{background:transparent;border-color:transparent;color:#a9bbd3;text-decoration:underline;text-underline-offset:3px}.context-preview-controls button{padding:4px 7px;font-size:11px}.preview-workspace-toolbar :focus-visible,.preview-frame-expand:focus-visible{outline:2px solid #dcc4ff;outline-offset:2px}@media(max-width:760px){.component-review:not(.embedded-expanded) .component-compare{grid-template-columns:minmax(0,1fr)!important}.component-review:not(.embedded-expanded) .component-arrow{transform:rotate(90deg);justify-self:center}}\n";document.head.append(style);
  document.addEventListener('keydown',event=>{
    if(!view?.expanded)return;
    if(event.key==='Escape'){event.preventDefault();closeWorkspace();return}
    if(event.key==='Tab'){
      const controls=[...view.component.querySelectorAll('button,select,iframe')].filter(n=>!n.disabled&&n.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
  });
  document.addEventListener('focusin',event=>{if(view?.expanded&&!view.component.contains(event.target))view.workspace.querySelector('button').focus({preventScroll:true})});
  window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('finding');if(view&&id&&by.has(id)&&id!==view.record.finding.id){closeWorkspace();select(id)}});
  // Browser history can replace the detail card without invoking the finding buttons.
  new MutationObserver(()=>{if(view&&(!view.component.isConnected||view.expanded?.portal&&!view.expanded.placeholder.isConnected))removeView()}).observe(document.body,{childList:true,subtree:true});
  function capability(f){
    const r=records.get(key(f));if(!r||view?.record!==r)return null;const [before,after]=view.items,info=r.contextInfo,status=before.state.dataset.contextStatus;
    const panelHidden=item=>!item.panel.getClientRects().length;
    // Before/After-only fullscreen hides a whole iframe, not its mapped target. Preserve its verified node/runtime.
    const verified=item=>!!item.frame&&item.contextReport?.route===info?.route?.path&&item.contextReport?.dir===r.mode&&(['verified','document'].includes(item.state.dataset.contextStatus)||panelHidden(item)&&item.lastVerifiedReport?.nonce===item.nonce&&item.lastVerifiedReport?.routeId===r.routeId&&item.lastVerifiedReport?.dir===r.mode);
    const proof=before.verifiedMapping,p=before.contextReport,bindingVerified=!!before.frame&&panelHidden(before)&&proof?.sourceHash===before.expectedHash&&proof?.routeId===r.routeId&&p?.route===info?.route?.path&&p?.dir===r.mode&&p?.routeReady&&p?.targets?.length>0&&(!info?.mapping.configured||!info.mapping.sourceSelector||p.sourceStatus==='source-rule-matched');

    return {application:info?.route?.application,routeId:r.routeId,bindingVerified:!!bindingVerified,verified:!r.contextResolving&&!!info?.route&&before.contextReport?.routeId===r.routeId&&before.contextReport?.dir===r.mode&&verified(before),blocked:['mapping-missing','source-not-loaded','target-mismatch','missing-target','unresolved'].includes(status)||status==='hidden'&&!panelHidden(before),failed:before.state.dataset.state==='error'||status==='runtime-unavailable',reason:before.state.textContent,candidateAvailable:!!info?.candidate?.available,candidateReady:verified(after),candidateFailed:after.state.dataset.state==='error',candidateReason:after.state.textContent};
  }
  function preparation(f,value){
    const record=records.get(key(f));if(!record||selected!==record.key||view?.record!==record)return;record.preparation=value;const current=view,after=current.items[1];after.state.dataset.preparationState=value.state;
    current.component.querySelector('[data-preview-retry]')?.remove();if(value.state==='unsupported'&&['Rejected','Deferred','Flagged'].includes(record.decision)&&record.manualPrepare&&!record.historical){const reconsider=el('button','Reconsider preview');reconsider.dataset.previewRetry='true';reconsider.disabled=!!value.busy;reconsider.onclick=record.manualPrepare;after.state.after(reconsider);}if(value.state==='failed'){const button=el('button','Retry preview');button.dataset.previewRetry='true';button.disabled=!!value.busy;button.onclick=record.retryPreview;after.state.after(button);}
    if(value.state!=='ready'){
      if(['failed','unsupported'].includes(value.state)){clearTimeout(after.timeout);after.box.replaceChildren();after.frame=null;after.ready=null;clearContextTargets(after);after.state.dataset.state=value.state==='failed'?'error':'unavailable';}
      setText(after.state,value.state==='failed'?'Preview preparation failed: '+value.reason+'. Retry preview.':value.state==='unsupported'?'Preview unavailable: '+value.reason:value.reason||'Preparing isolated preview…');
    }
    syncControls(current);
  }
  function refresh(f){const record=records.get(key(f));if(record&&selected===record.key&&view?.record===record){record.preparation=null;routes(record,f,view);}}

  return{configure,select:choose,capability,preparation,refresh};
})();
`;
