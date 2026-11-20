import { reviewNavigationModel } from './dashboard-review-navigation.js';
import { reviewDetailsClientSource } from './dashboard-review-details.js';
/** Uses the approved dashboard cards and the existing embedded route renderer. */
export const workflowClientSource = String.raw`
const workflowStyle=el('style');workflowStyle.textContent='.review-pane{overflow-anchor:none}.workflow-owned .apply-advanced,.workflow-owned .reviewer-context{display:none!important}.workflow-controls{font-size:11px;grid-column:1/-1}body:has(.review-session-toolbar){overflow-x:clip;overflow-y:visible}.workspace:has(.review-session-toolbar){overflow:clip!important}.review-session-toolbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 8px;margin:0 8px 6px;background:#13243a;border:1px solid #496488;border-radius:9px;box-shadow:0 5px 14px #0004}.session-identity{display:flex;align-items:center;gap:10px;flex:1;min-width:140px}.session-identity strong{font-size:12px}.session-identity span{font-size:10px;color:#adc0d8}.review-session-toolbar button,.session-overflow>button{font:600 11px Inter,system-ui;color:#e7eefb;background:#1b304c;border:1px solid #526d91;border-radius:6px;padding:6px 8px;cursor:pointer}.review-session-toolbar button:disabled{opacity:.5;cursor:default}.review-session-toolbar .session-primary{background:#6330af;border-color:#ac80ee}.session-validation{font-size:11px;color:#b8c6d9}.session-validation[data-status=Passed]{color:#5de0a6}.session-validation[data-status=Failed]{color:#ff8193}.session-validation[data-status="Limited validation"]{color:#ffd166}.session-policy{flex-basis:100%;font-size:10px;color:#b8c6d9;margin:0;max-height:70px;overflow:auto}.session-overflow{position:relative;flex:none}.session-overflow>button{list-style:none;white-space:nowrap}.session-overflow>button::-webkit-details-marker{display:none}.session-overflow>button:after{content:"⌄";margin-left:8px;color:#bdabdc}.session-overflow>button[aria-expanded=true]{border-color:#b58be9;background:#302449}.session-menu{position:fixed;inset:auto;box-sizing:border-box;width:238px;max-width:calc(100vw - 20px);margin:0;padding:6px;border:1px solid #657da2;border-radius:9px;background:#14243a;color:#e7eefb;box-shadow:0 12px 32px #0009;overflow:auto}.session-menu:popover-open{display:flex;flex-direction:column;gap:3px;height:auto;min-height:0;align-items:stretch}.session-menu button{flex:none}.session-menu small{display:block;margin-top:3px;font-weight:400;color:#bac6d7}.session-menu button{display:block;width:100%;text-align:left;white-space:normal;border:1px solid transparent;background:transparent;padding:9px 10px;margin:0;font-size:12px}.session-menu button:hover:not(:disabled),.session-menu button:focus-visible{background:#2b3b57;border-color:#a17cd5}.session-menu button:disabled{opacity:.45}.semantic-review{margin-top:6px;border-top:1px solid #304563;font-size:11px}.semantic-review>summary{padding:6px 0 1px;color:#d3bef2;cursor:pointer}.semantic-review p{margin:6px 0 0;color:#b8c9df;line-height:1.6}.semantic-review[hidden]{display:none}.review-session-toolbar :focus-visible{outline:2px solid #d5b2ff;outline-offset:2px}.workflow-controls textarea{box-sizing:border-box;width:100%;min-height:96px;padding:10px;resize:vertical;white-space:pre-wrap;overflow-x:hidden;overflow-wrap:anywhere;color:#e7eefb;background:#102039;border:1px solid #385579;border-radius:6px}.workflow-controls pre{max-height:260px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}.workflow-controls .actions{flex-wrap:wrap}.workflow-validation{max-height:160px;overflow:auto}.workflow-controls details{margin-top:8px}.workflow-controls summary{cursor:pointer;color:#cdb7ff}';document.head.append(workflowStyle);
${reviewDetailsClientSource}
const reviewWorkflow=(()=>{
  let workflow=null,history=null,busy=false,busyLabel='',error='',scope=[],reloading=false,overflowOpen=false;
  let overflowUI=null;const noteDrafts=new Map(),noteFeedback=new Map();
  function positionOverflow(){
    if(!overflowUI?.menu.open||!overflowUI.panel.isConnected)return;
    const {toggle,panel}=overflowUI,anchor=toggle.getBoundingClientRect(),gap=7,edge=10;
    panel.style.maxHeight=Math.max(80,innerHeight-edge*2)+'px';
    const box=panel.getBoundingClientRect(),below=innerHeight-anchor.bottom-gap-edge,above=anchor.top-gap-edge;
    panel.style.left=Math.max(edge,Math.min(anchor.right-box.width,innerWidth-box.width-edge))+'px';
    panel.style.top=Math.max(edge,below>=box.height||below>=above?Math.min(anchor.bottom+gap,innerHeight-box.height-edge):anchor.top-gap-box.height)+'px';
  }
  function setOverflow(open,focus=false){
    if(!overflowUI)return;const {menu,toggle,panel}=overflowUI;overflowOpen=open;menu.open=open;toggle.setAttribute('aria-expanded',String(open));
    if(open){if(!panel.matches(':popover-open'))panel.showPopover();positionOverflow();if(focus)([...panel.querySelectorAll('button')].filter(b=>!b.disabled)[0]||toggle).focus({preventScroll:true});}
    else{if(panel.matches(':popover-open'))panel.hidePopover();if(focus)toggle.focus({preventScroll:true});}
  }
  document.addEventListener('pointerdown',event=>{if(overflowUI?.menu.open&&!overflowUI.menu.contains(event.target))setOverflow(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overflowUI?.menu.open){event.preventDefault();event.stopPropagation();setOverflow(false,true);}});
  document.addEventListener('focusin',event=>{if(overflowUI?.menu.open&&!overflowUI.menu.contains(event.target))setOverflow(false);});
  addEventListener('resize',positionOverflow);document.addEventListener('scroll',positionOverflow,true);
  const endpoint='/review/workflows';
  const api=async(path,body)=>{let response;try{response=await fetch(previewOrigin+path,body===undefined?undefined:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}catch{throw Error('COMPANION_UNAVAILABLE')}const result=await response.json();if(!response.ok)throw Error(result.error||'WORKFLOW_REQUEST_FAILED');return result};
  const state=(message,explanation)=>{
    const card=document.querySelector('.code-diff-card');if(!card)return;let node=card.querySelector('.analysis-status');if(!node){node=el('p','','analysis-status');node.setAttribute('role','status');card.append(node)}if(node.textContent!==message)node.textContent=message;
    const body=document.querySelector('.details-card .more-details-body')||document.querySelector('.details-card');let caveat=body?.querySelector('.semantic-review');if(body&&!caveat&&explanation){caveat=el('p','','semantic-review');body.append(caveat)}
    if(caveat&&explanation!==undefined){caveat.hidden=!explanation;if(caveat.textContent!==explanation)caveat.textContent=explanation;}

  };
  function reloadTransition(next){const anchor=s.finding?{path:s.finding.path,ruleId:s.finding.ruleId,line:s.finding.line,column:s.finding.column}:null,key='rtl-source-selection:'+next.id;if(next.state==='Applied'&&anchor)sessionStorage.setItem(key,JSON.stringify(anchor));let selection=anchor;if(next.state==='Rolled Back'){try{selection=JSON.parse(sessionStorage.getItem(key))||anchor}catch{}}reloading=true;embeddedReview.select(null);sessionStorage.setItem('rtl-source-transition',JSON.stringify({workflowId:next.id,mode:next.mode,state:next.state,selection}));location.reload();}
  async function operate(operation,label='Loading review'){if(busy||reloading)return;busy=true;busyLabel=label;error='';render();try{const result=await operation();if(result?.workflow){const changed=workflow&&workflow.state!==result.workflow.state;if(workflow&&workflow.id!==result.workflow.id)history=(await api(endpoint+'?history=1')).workflows.filter(w=>w.id!==result.workflow.id);workflow=result.workflow;if(changed&&['Applied','Rolled Back'].includes(workflow.state)){reloadTransition(workflow);return}}return result;}catch(e){error=e.message;if(workflow?.id){try{const current=await api(endpoint+'/'+workflow.id);if(current.workflow){const changed=workflow.state!==current.workflow.state;workflow=current.workflow;if(changed&&['Applied','Rolled Back'].includes(workflow.state))reloadTransition(workflow)}}catch{}}}finally{busy=false;if(!reloading)render()}}
  const action=(name,fn,disabled=false)=>{const b=el('button',name);b.disabled=busy||disabled;b.onclick=()=>{const menu=b.closest('.session-overflow');if(menu){setOverflow(false,true);}operate(fn,name)};return b};
  const change=(f,kind,notes)=>api(endpoint+'/'+workflow.id+'/change',{findingId:f.id,action:kind,notes:notes||''});
  function closeApproval(dialog,restore=true){if(dialog?.open)dialog.close();dialog?.remove();if(restore&&s.finding){const heading=document.querySelector('.finding-title');heading?.focus({preventScroll:true})}}
  const navigationModel=${reviewNavigationModel.toString()};
  function navigation(){
    const entries=workflow?.state==='Reviewing'&&!sourceContextError?workflow.entries:[],decisions=Object.fromEntries(entries.map(e=>[e.finding.id,e.decision]));
    const findings=sortRows(all.filter(f=>(s.app==='all'||f.applications.includes(s.app))&&(!workflow?.scope?.length||workflow.scope.includes(f.path))));
    return navigationModel({findings,visibleIds:match().map(f=>f.id),currentId:s.finding?.id,decisions});
  }
  function selectReviewFinding(f,outsideFilters=false){
    if(!f)return;
    if(outsideFilters){s.q='';search.value='';s.severity=s.status=s.eligibility=s.category='all';severityFilter.value=statusFilter.value=eligibilityFilter.value=categoryFilter.value='all';}
    window.dispatchEvent(new CustomEvent('rtl-dashboard-select',{detail:f.id}));requestAnimationFrame(()=>document.querySelector('.finding-title')?.focus({preventScroll:true}));
  }
  function stepDescription(n){return n.target?(n.crossFile?n.target.path+' · '+n.destinationPending+' pending in destination · '+n.pending.length+' pending in project. ':'')+(n.outsideFilters?'Outside current filters. Continuing clears search and finding filters; workspace scope stays selected.':''):'';}
  function advance(){const n=navigation();if(n.target)selectReviewFinding(n.target,n.outsideFilters);else showReviewSummary();}
  function paintNavigation(){
    const n=navigation();let recovery=document.querySelector('.review-filter-recovery');if(!match().length&&n.hiddenUnresolved.length){if(!recovery){recovery=el('section','','review-filter-recovery');const text=el('p'),button=el('button','Continue outside filters');recovery.append(text,button);document.querySelector('.review-pane')?.prepend(recovery)}recovery.querySelector('p').textContent=n.hiddenUnresolved.length+' unresolved findings are hidden by search or finding filters. Continuing clears those filters; workspace scope stays selected.';recovery.querySelector('button').onclick=()=>selectReviewFinding(n.hiddenPending[0]||n.hiddenUnresolved[0],true);}else recovery?.remove();for(const b of document.querySelectorAll('.review-next')){b.textContent=n.label;b.title=stepDescription(n);b.disabled=busy;b.onclick=advance;}
    for(const b of document.querySelectorAll('.review-previous')){b.disabled=busy||!n.previous;b.onclick=()=>selectReviewFinding(n.previous);}
    const description=document.querySelector('.decision-card .review-next-destination');if(description){description.textContent=stepDescription(n);description.hidden=!description.textContent;}
    const counter=document.querySelector('.source-counter');if(counter)counter.textContent='In file: '+Math.max(0,n.at+1)+' of '+n.file.length+' · Project: '+n.pending.length+' pending / '+n.total;
  }
  window.rtlReviewNavigation=()=>navigation();
  function showApprovalConfirmation(f){document.querySelector('.approval-confirmation')?.remove();const dialog=document.createElement('dialog');dialog.className='approval-confirmation';dialog.setAttribute('aria-labelledby','approval-title');dialog.setAttribute('aria-describedby','approval-description');const title=el('h2','Proposed change approved');title.id='approval-title';const message=el('p','Added to your accepted changes. Your project files have not changed. Validate accepted changes before applying them.');message.id='approval-description';const actions=el('div','','actions'),n=navigation(),next=el('button',n.label),stay=el('button','Stay on this finding');next.type=stay.type='button';next.onclick=()=>{dialog.close();dialog.remove();advance()};stay.onclick=()=>closeApproval(dialog,true);actions.append(next,stay);dialog.append(title,message);if(stepDescription(n))dialog.append(el('p',stepDescription(n),'review-next-destination'));dialog.append(actions);dialog.addEventListener('cancel',event=>{event.preventDefault();closeApproval(dialog,true)});dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();next.focus()}
  function showReviewSummary(){
    const n=navigation(),dialog=document.createElement('dialog');dialog.className='approval-confirmation review-summary-dialog';dialog.setAttribute('aria-labelledby','summary-title');dialog.setAttribute('aria-describedby','summary-description');const title=el('h2','Review summary');title.id='summary-title';
    const description=el('p',n.accepted.length+' accepted · '+n.rejected.length+' rejected · '+n.unresolved.length+' unresolved ('+n.pending.length+' pending). Scope: '+n.total+' reviewable findings across the selected project/workspace. Accepted changes still require validation and a separate Apply step. Rejected, deferred and Needs review items are not applied.');description.id='summary-description';dialog.append(title,description);
    if(n.hiddenUnresolved.length)dialog.append(el('p',n.hiddenUnresolved.length+' unresolved findings are hidden by search or finding filters. Continuing outside filters explicitly clears those filters; workspace scope stays selected.','review-hidden-findings'));
    const actions=el('div','','actions'),back=el('button','Review unresolved');back.disabled=!n.unresolved.length;back.onclick=()=>{let list=dialog.querySelector('.unresolved-findings');if(list){list.remove();return}list=el('div','','unresolved-findings');for(const f of n.unresolved){const hidden=!match().some(x=>x.id===f.id),decision=workflow?.entries.find(e=>e.finding.id===f.id)?.decision||'Pending',b=el('button',f.path+' · '+(decision==='Flagged'?'Needs review':decision)+(hidden?' · Continue outside filters':''));b.onclick=()=>{dialog.close();dialog.remove();selectReviewFinding(f,hidden)};list.append(b)}dialog.append(list);list.querySelector('button')?.focus()};
    if(n.hiddenPending.length){const outside=el('button','Continue outside filters');outside.onclick=()=>{dialog.close();dialog.remove();selectReviewFinding(n.hiddenPending[0],true)};actions.append(outside)}
    const validation=el('button','Validate accepted changes');validation.disabled=!n.accepted.length||!!sourceContextError||busy||workflow?.state!=='Reviewing'||workflow?.applyEligibility?.eligible===true;validation.onclick=()=>{dialog.close();dialog.remove();document.querySelector('.session-primary')?.click()};const stay=el('button','Close summary');stay.onclick=()=>{dialog.close();dialog.remove()};actions.prepend(back);actions.append(validation,stay);dialog.append(actions);dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();dialog.remove()});document.body.append(dialog);dialog.showModal();(back.disabled?stay:back).focus();
  }
  async function approve(f,notes){if(busy||f.id!==s.finding?.id)return;const result=await operate(()=>change(f,'Accepted',notes));if(result?.workflow?.entries?.some(e=>e.finding.id===f.id&&e.decision==='Accepted'))showApprovalConfirmation(f)}
  const rollback=()=>{if(!window.confirm('Rollback this workflow? Later user edits will block rollback.'))return;return api(endpoint+'/'+workflow.id+'/rollback',{confirmation:'ROLLBACK_CONFIRMED'})};

  const previewAttempts=new Map();let previewFlight=null;
  const previewKey=(f,c)=>[workflow?.id,d.inputDigest,d.policyDigest,f.id,c?.application,c?.routeId,workflow?.session?.runtime?.status||'not-started',workflow?.entries.filter(e=>e.applied).map(e=>e.finding.id).join(',')].join('|');
  const paintPreview=(f,state,reason='')=>embeddedReview.preparation(f,{state,reason,busy:busy||!!previewFlight});
  function retryPreview(f){if(busy||previewFlight||s.finding?.id!==f.id)return;previewAttempts.delete(previewKey(f,embeddedReview.capability(f)));embeddedReview.refresh(f);}
  async function automaticPreview(){
    const f=s.finding;if(!f||!workflow||sourceContextError||reloading)return;
    const e=workflow.entries.find(e=>e.finding.id===f.id),c=embeddedReview.capability(f);
    if(workflow.state!=='Reviewing'||!e?.patch||['Rejected','Deferred','Flagged'].includes(e.decision)){paintPreview(f,'unsupported',workflow.state!=='Reviewing'?'Historical review; current candidate preparation is unavailable.':!e?.patch?e?.reason||'Finding outside the current review scope.':e.decision+' decision; automatic preparation will not restore this patch.');return;}
    const key=previewKey(f,c),attempt=previewAttempts.get(key),runtimeCurrent=workflow.session?.runtime?.status==='healthy';
    if(c?.resolving){paintPreview(f,'waiting','Resolving the current isolated preview context…');return;}
    if(attempt?.state==='failed'){paintPreview(f,'failed',attempt.reason);return;}
    if(!c?.verified&&!(e.applied&&runtimeCurrent&&c?.candidateAvailable&&c?.bindingVerified)){paintPreview(f,c?.blocked?'unsupported':c?.failed?'failed':'waiting',c?.reason||'Verifying the original source, route and rendered target…');return;}
    if(e.applied&&runtimeCurrent&&c.candidateReady){paintPreview(f,'ready');return;}
    if(e.applied&&runtimeCurrent&&c.candidateAvailable){
      if(c.candidateFailed){const failed={state:'failed',reason:c.candidateReason||'Candidate source/target verification failed.'};previewAttempts.set(key,failed);paintPreview(f,'failed',failed.reason);}
      else paintPreview(f,'preparing','Checking the isolated candidate source and rendered target…');
      return;
    }
    if(attempt?.state==='prepared'&&runtimeCurrent){const failed={state:'failed',reason:c.candidateReason||'Prepared candidate runtime is unavailable. Retry preview.'};previewAttempts.set(key,failed);paintPreview(f,'failed',failed.reason);return;}
    if(busy||previewFlight){paintPreview(f,'preparing','Waiting for the current isolated preview preparation…');return;}
    const owner=workflow.id,operation={state:'preparing',reason:''};previewAttempts.set(key,operation);previewFlight=operation;busy=true;render();paintPreview(f,'preparing','Preparing the isolated candidate and starting its verified application route…');
    try{
      const result=await api(endpoint+'/'+owner+'/prepare-preview',{findingId:f.id,application:c.application,routeId:c.routeId,inputDigest:d.inputDigest,policyDigest:d.policyDigest});
      if(workflow?.id===owner){workflow=result.workflow;operation.state='prepared';previewAttempts.set(previewKey(f,c),operation);}
    }catch(failure){
      operation.state='failed';operation.reason=failure.message;
      // A runtime failure may follow a successful isolated patch. Reconcile that exact workflow before retry.
      if(workflow?.id===owner){try{const current=await api(endpoint+'/'+owner);if(workflow?.id===owner)workflow=current.workflow;}catch{}previewAttempts.set(previewKey(f,c),operation);}
    }finally{previewFlight=null;busy=false;if(!reloading)render();}
  }
  window.addEventListener('rtl-context-preview-updated',event=>{if(workflow?.id===event.detail.workflowId&&s.finding?.id===event.detail.findingId)automaticPreview();});
  function sessionToolbar(){
    const source=document.querySelector('.code-scroll'),code=source?.parentElement,pane=code?.parentElement,meta=code?.querySelector('.meta');if(!pane||!code||!source)return;if(meta)pane.insertBefore(meta,code);const previous=pane.querySelector('.review-session-toolbar'),menuOpen=previous?.querySelector('.session-overflow')?.open??overflowOpen,focused=previous?.contains(document.activeElement)?document.activeElement:null,focusKey=focused?.dataset.sessionAction,focusLabel=focused?.textContent,focusPrimary=focused?.classList.contains('session-primary');previous?.remove();
    const bar=el('section','','review-session-toolbar');bar.setAttribute('aria-label','Review session');bar.setAttribute('aria-busy',String(busy));pane.insertBefore(bar,code);
    const historical=sourceContextError||workflow?.state!=='Reviewing',current=historical?null:workflow,selected=workflow?.entries.filter(e=>e.decision==='Accepted').length||0;
    const identity=el('div','','session-identity');identity.title=workflow?(workflow.mode==='one-by-one'?'One by one review':'Prepare all, then review'):'Review session';identity.append(el('strong','Current review · '+(workflow?.mode==='apply-first'?'Prepare all, then review':'One by one')),el('span',selected+' accepted'+(historical?' · '+(workflow?.state||'Loading'):''),'workflow-summary'));bar.append(identity);
    const status=current?.validationPresentation?.status||'Not run',summary=el('span','Validation: '+status,'workflow-validation session-validation');summary.dataset.status=status;summary.title=current?.validationPresentation?.explanation||'Historical validation cannot validate this review.';bar.append(summary);
    const detailButton=el('button','Session details');detailButton.dataset.reviewDetails='true';detailButton.onclick=()=>reviewDetails.open(detailButton,current,historical?[workflow,...(Array.isArray(history)?history:history?[history]:[])].filter(Boolean):history);bar.append(detailButton);
    const eligible=!sourceContextError&&workflow?.applyEligibility?.eligible;
    const applyLabel=selected===1?'Apply 1 accepted change to source':'Apply '+selected+' accepted changes to source';
    const validateLabel='Validate changes';
    const primary=eligible?action(applyLabel,()=>{if(!window.confirm('Apply only explicitly accepted, validated changes to the original source? Recoverable backups will be retained.'))return;return api(endpoint+'/'+workflow.id+'/apply',{confirmation:'APPLY_CONFIRMED'})}):action(validateLabel,()=>api(endpoint+'/'+workflow.id+'/validate',{}),!!historical||!selected);
    primary.className='session-primary';if(busy)primary.textContent=previewFlight?'Preparing preview…':busyLabel.startsWith('Validate')?'Validating changes…':busyLabel.startsWith('Apply')?(selected===1?'Applying accepted change…':'Applying accepted changes…'):busyLabel+'…';bar.append(primary);
    const menu=el('div','','session-overflow'),toggle=el('button','Review actions'),panel=el('div','','session-menu');toggle.setAttribute('aria-label','Review actions');toggle.setAttribute('aria-haspopup','menu');toggle.setAttribute('aria-controls','review-session-menu');toggle.dataset.sessionAction='overflow';panel.id='review-session-menu';panel.setAttribute('popover','manual');panel.setAttribute('role','menu');panel.setAttribute('aria-label','Review actions');menu.append(toggle,panel);bar.append(menu);overflowUI={menu,toggle,panel};
    const rollbackButton=action('Rollback applied changes',rollback,!['Applied','Applying'].includes(workflow?.state)||!workflow?.receipts?.length),restartButton=action('Start new review',()=>api(endpoint,{inputDigest:d.inputDigest,policyDigest:d.policyDigest,mode:workflow.mode,scope:workflow.scope,restart:true}),!workflow||!!sourceContextError||workflow.state==='Applying');
    rollbackButton.setAttribute('aria-label','Rollback applied changes');if(!['Applied','Applying'].includes(workflow?.state)||!workflow?.receipts?.length)rollbackButton.append(el('small','Available after Apply'));
    for(const [key,button] of [['rollback',rollbackButton],['restart',restartButton]]){button.dataset.sessionAction=key;button.setAttribute('role','menuitem');panel.append(button);}
    const summaryButton=el('button','Review summary');summaryButton.setAttribute('role','menuitem');summaryButton.onclick=()=>{setOverflow(false);showReviewSummary()};panel.append(summaryButton);
    toggle.onclick=event=>{event.preventDefault();setOverflow(!menu.open);};
    toggle.onkeydown=event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();setOverflow(true,true);if(event.key==='ArrowUp')[...panel.querySelectorAll('button')].filter(b=>!b.disabled).at(-1)?.focus();}};
    panel.onkeydown=event=>{const buttons=[...panel.querySelectorAll('button')].filter(b=>!b.disabled),index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length]?.focus();}if(event.key==='Tab'){setOverflow(false,true);}};
    setOverflow(!!menuOpen);
    if(error||sourceContextError){const warning=el('p',error||sourceContextError,'session-policy');warning.setAttribute('role','alert');bar.append(warning);}
    primary.title=workflow?.applyEligibility?.reason||'Validate accepted changes before Apply.';
    if(current?.validationPresentation?.status==='Failed'||current?.validationPresentation?.status==='Unavailable'){bar.append(el('p',workflow.applyEligibility?.reason||current.validationPresentation.explanation,'session-policy'));}
    const focusTarget=focusPrimary?primary:[...bar.querySelectorAll('button,summary')].find(n=>focusKey?n.dataset.sessionAction===focusKey:n.textContent===focusLabel);if(focused)(focusTarget&&!focusTarget.disabled?focusTarget:toggle).focus({preventScroll:true});
  }
  function updateDecisionIndicators(){
    for(const row of document.querySelectorAll('.finding[data-finding-id]')){
      const decision=!sourceContextError&&workflow?.state==='Reviewing'?workflow.entries.find(e=>e.finding.id===row.dataset.findingId)?.decision||'Pending':'Pending';
      const [label,symbol,tone]=({Accepted:['Accepted','✓','accepted'],Rejected:['Rejected','×','rejected'],Deferred:['Deferred','◷','deferred'],Flagged:['Needs review','◇','flagged'],Pending:['Pending','○','pending']})[decision]||['Pending','○','pending'];
      let icon=row.querySelector('.finding-decision');if(!icon){icon=el('span','','finding-decision');icon.setAttribute('role','img');row.append(icon)}icon.textContent=symbol;icon.dataset.decision=decision;icon.dataset.tone=tone;icon.setAttribute('aria-label',label);icon.title=label;
    }
  }
  window.rtlRenderReviewIndicators=()=>{updateDecisionIndicators();paintNavigation()};
  const indicatorStyle=el('style');indicatorStyle.textContent='.finding{position:relative;padding-inline-end:34px!important}.finding>strong,.finding>small{overflow-wrap:anywhere;min-width:0}.finding-decision{position:absolute;inset-inline-end:10px;top:50%;transform:translateY(-50%);width:18px;text-align:center;font:700 17px/1.2 system-ui;color:#a3adbb;pointer-events:none}.finding-decision[data-tone=accepted]{color:#55dc9e}.finding-decision[data-tone=rejected]{color:#ff8193}.finding-decision[data-tone=deferred]{color:#ffd166}.finding-decision[data-tone=flagged]{color:#c39aff}';document.head.append(indicatorStyle);
  function render(){
    updateDecisionIndicators();paintNavigation();
    const f=s.finding;if(!localStorage.getItem('rtl-review-workflow'))return;if(!f){sessionToolbar();reviewDetails.update(workflow?.state==='Reviewing'?workflow:null,workflow?.state!=='Reviewing'?[workflow,...(history||[])].filter(Boolean):history);return;}
    normalizeComponentReview();normalizeDecision();sessionToolbar();
    const card=document.querySelector('.decision-card'),component=document.querySelector('.component-review');if(!card)return;
    card.classList.add('workflow-owned');card.querySelectorAll('.workflow-controls').forEach(n=>n.remove());
    const actions=card.querySelector('.decision-actions');if(!actions)return;actions.replaceChildren();
    const controls=el('div','','workflow-controls');card.append(controls);
    if(sourceContextError){state((workflow?.state==='Rolled Back'||pendingSourceTransition?.state==='Rolled Back'?'Rollback succeeded. Rescan failed: ':'Source context blocked: ')+sourceContextError+'. Displayed report is a stale snapshot; current analysis is unavailable.');document.querySelector('.after-card pre').textContent='Fresh suggestion unavailable until rescan succeeds.';controls.append(el('p','Source context blocked: '+sourceContextError,'source-context-status'),action('Retry rescan',()=>{sessionStorage.setItem('rtl-source-transition',JSON.stringify(pendingSourceTransition||{mode:workflow?.mode||localStorage.getItem('rtl-review-workflow')}));reloading=true;location.reload()}));if(workflow){}return;}
    if(error){state('Blocked: '+error);controls.append(action('Retry connection',()=>restore(true)));}
    if(!workflow){if(!error)state(busy?'Analyzing scan and codemod inventory…':'Start a review workflow to analyze this report.');return;}
    const historical=workflow.state!=='Reviewing',e=historical?null:workflow.entries.find(e=>e.finding.id===f.id),locked=historical;
    reviewDetails.update(historical?null:workflow,historical?[workflow,...(history||[])]:history);
    const selected=workflow.entries.filter(e=>e.decision==='Accepted').length;

    const feedbackKey='rtl-rollback-feedback:'+workflow.id;
    if(workflow.resumedFrom&&!historical&&!workflow.validation&&workflow.entries.every(e=>e.decision==='Pending'&&!e.history.length)&&!sessionStorage.getItem(feedbackKey)){const feedback=el('p','Rollback succeeded · Automatic rescan complete · Fresh review ready. ','source-context-status');const dismiss=el('button','Dismiss');dismiss.setAttribute('aria-label','Dismiss rollback notification');dismiss.onclick=()=>{sessionStorage.setItem(feedbackKey,'dismissed');render()};feedback.append(dismiss);controls.append(feedback);}

    if(historical){['Approve fix','Reject fix','Defer','Needs review'].forEach(label=>actions.append(action(label,()=>{},true)));controls.append(el('p',workflow.state==='Rolled Back'?'Source restored · Start a fresh review.':workflow.state==='Applying'?'Source apply incomplete · Use Rollback to recover. History: Session details.':'Source applied · Current source shown. History and recovery: Session details.','source-context-status'));document.querySelector('.after-card pre').textContent='Current source · No current candidate. '+((f.eligibilityBlockers||[]).join('; ')||'Review this finding separately.');}if(sourceContextError)controls.append(el('p','Source context blocked: '+sourceContextError,'source-context-status'));
    if(e){
      document.querySelector('.before-card pre').textContent=e.finding.original;
      document.querySelector('.after-card pre').textContent=e.patch?e.patch.replacement:'No supported automatic fix. '+e.reason;
      if(!error)state(e.applied?(e.decision==='Accepted'?'Accepted · In accepted review set':'Preview ready · Pending approval'):e.decision+' · Not in review preview',e.reason);
      const noteKey=workflow.id+':'+f.id,draft=noteDrafts.get(noteKey),notes=el('textarea');notes.maxLength=4000;notes.setAttribute('aria-label','Review note');notes.value=draft?.value??e.notes;notes.disabled=busy;
      const noteBox=el('details','','workflow-notes'),noteSummary=el('summary',e.notes?'Edit review note':'Add review note');noteBox.open=draft?.open||false;noteBox.append(noteSummary,notes);
      notes.oninput=()=>{noteDrafts.set(noteKey,{value:notes.value,open:true});noteFeedback.delete(noteKey);feedback.textContent='Unsaved draft retained for this finding.'};
      noteBox.ontoggle=()=>{const current=noteDrafts.get(noteKey);if(noteBox.isConnected)noteDrafts.set(noteKey,{value:current?.value??notes.value,open:noteBox.open})};
      const feedback=el('p',noteFeedback.get(noteKey)|| (draft&&draft.value!==e.notes?'Unsaved draft retained for this finding.':''));feedback.setAttribute('role','status');
      noteBox.append(action('Save note',async()=>{const result=await change(f,'notes',notes.value);noteDrafts.delete(noteKey);noteFeedback.set(noteKey,'Note saved.');return result;}));
      const cancel=el('button','Cancel');cancel.disabled=busy;cancel.onclick=()=>{noteDrafts.delete(noteKey);noteFeedback.set(noteKey,'Unsaved edits discarded. Saved note retained.');render()};noteBox.append(cancel);controls.append(noteBox,feedback);
      const approveButton=action(e.decision==='Accepted'?'Already accepted':f.ruleId==='RTL.CSS.PHYSICAL'?'Approve proposed change':'Approve fix',()=>{},locked||!e.patch||!e.applied||e.decision==='Accepted');
      // approve owns the save operation so its persisted result can open the dialog.
      approveButton.onclick=()=>approve(f,e.notes);actions.append(approveButton);
      const n=navigation(),nextStep=el('button',n.label);nextStep.type='button';nextStep.disabled=locked;nextStep.className='persistent-next-finding review-next';nextStep.title=stepDescription(n);nextStep.onclick=advance;actions.append(nextStep);const destination=el('p',stepDescription(n),'review-next-destination');destination.hidden=!destination.textContent;controls.prepend(destination);
      actions.append(action('Reject fix',()=>change(f,'Rejected',e.notes),locked));
      actions.append(action('Defer',()=>change(f,'Deferred',e.notes),locked));
      actions.append(action('Needs review',()=>change(f,'Flagged',e.notes),locked));
      [...actions.querySelectorAll('button')].filter(button=>!button.classList.contains('persistent-next-finding')).forEach((button,index)=>button.setAttribute('aria-pressed',String(['Accepted','Rejected','Deferred','Flagged'][index]===e.decision)));card.querySelector('.decision-heading span:last-child').textContent=e.decision;
      embeddedReview.configure(f,{onRetryPreview:()=>retryPreview(f),...(e.patch?{patch:e.patch,onApply:()=>operate(async()=>{const result=await change(f,'apply');previewAttempts.clear();return result;})}:{}),workflow});
      const previewButton=[...card.querySelectorAll('button')].find(b=>['Apply & Preview','Prepare candidate','Open candidate preview','Retry candidate preview'].includes(b.textContent));if(previewButton)previewButton.disabled=busy||locked;
    }else{if(!error)state(historical?'Current source · No current candidate · Validation Not run. History: Session details.':'Finding outside selected workflow scope.');embeddedReview.configure(f,{workflow});}
    const validation=el('p','Current review · '+(e?.decision||'Pending')+' · '+(e?.applied?(e.decision==='Accepted'?'Accepted for validation':'Review preview only'):'Not in review preview'),'current-review-status workflow-decision');controls.append(validation);
    // These legacy one-patch operations remain available to API regressions; this workflow owns its distinct lifecycle.
    card.querySelectorAll('.reviewer-context,.apply-advanced').forEach(n=>n.hidden=true);
  }
  async function restore(create=false,mode=localStorage.getItem('rtl-review-workflow')){
    if(!mode)return;const result=await api(pendingSourceTransition?.workflowId?endpoint+'/'+pendingSourceTransition.workflowId:endpoint+'?'+new URLSearchParams({inputDigest:dashboardSnapshot.inputDigest,policyDigest:dashboardSnapshot.policyDigest,mode}));
    if(result.workflow){workflow=result.workflow;history=(await api(endpoint+'?history=1')).workflows.filter(w=>w.id!==workflow.id);scope=workflow.scope;if(!sourceContextError&&workflow.state==='Rolled Back'){history=[workflow,...history.filter(w=>w.id!==workflow.id)];const next=await api(endpoint+'/'+workflow.id+'/resume',{});workflow=next.workflow;pendingSourceTransition=null;return next;}if(!sourceContextError)pendingSourceTransition=null;return result;}
    if(create){const next=await api(endpoint,{inputDigest:d.inputDigest,policyDigest:d.policyDigest,mode,scope});workflow=next.workflow;return next;}
    if(!sourceContextError)showWorkflowScreen();
  }
  // Companion health/recovery also rebuilds detail directly. Restore workflow and Before after every rebuild.
  const workflowDetail=detail;detail=f=>{reviewDetails.close();embeddedReview.select(null);workflowDetail(f);render()};
  window.addEventListener('rtl-review-workflow-entered',event=>{embeddedReview.select(null);workflow=null;history=null;scope=event.detail.scope;operate(()=>restore(true,event.detail.mode))});
  window.addEventListener('rtl-context-runtime-request',event=>{if(workflow?.id===event.detail.workflowId)operate(()=>api(endpoint+'/'+workflow.id+'/runtime',{application:event.detail.application}))});
  // Reload restores persisted state without initiating batch application again.
  setTimeout(()=>{if(localStorage.getItem('rtl-review-workflow'))operate(()=>restore(false))},0);
  return{render};
})();
`;
