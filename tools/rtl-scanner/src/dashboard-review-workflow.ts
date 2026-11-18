import { reviewDetailsClientSource } from './dashboard-review-details.js';
/** Uses the approved dashboard cards and the existing embedded route renderer. */
export const workflowClientSource = String.raw`
const workflowStyle=el('style');workflowStyle.textContent='.workflow-owned .apply-advanced,.workflow-owned .reviewer-context{display:none!important}.workflow-controls{font-size:11px}.workflow-controls textarea{box-sizing:border-box;width:100%;min-height:38px;color:#e7eefb;background:#102039;border:1px solid #385579;border-radius:6px}.workflow-controls pre{max-height:260px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}.workflow-controls .actions{flex-wrap:wrap}.workflow-validation{max-height:160px;overflow:auto}.workflow-controls details{margin-top:8px}.workflow-controls summary{cursor:pointer;color:#cdb7ff}';document.head.append(workflowStyle);
${reviewDetailsClientSource}
const reviewWorkflow=(()=>{
  let workflow=null,history=null,busy=false,error='',scope=[],reloading=false;
  const endpoint='/review/workflows';
  const api=async(path,body)=>{let response;try{response=await fetch(previewOrigin+path,body===undefined?undefined:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}catch{throw Error('COMPANION_UNAVAILABLE')}const result=await response.json();if(!response.ok)throw Error(result.error||'WORKFLOW_REQUEST_FAILED');return result};
  const state=message=>{let node=document.querySelector('.analysis-status');if(!node){node=el('p','','analysis-status');node.setAttribute('role','status');document.querySelector('.code-diff-card')?.append(node)}node.textContent=message};
  function reloadTransition(next){const anchor=s.finding?{path:s.finding.path,ruleId:s.finding.ruleId,line:s.finding.line,column:s.finding.column}:null,key='rtl-source-selection:'+next.id;if(next.state==='Applied'&&anchor)sessionStorage.setItem(key,JSON.stringify(anchor));let selection=anchor;if(next.state==='Rolled Back'){try{selection=JSON.parse(sessionStorage.getItem(key))||anchor}catch{}}reloading=true;embeddedReview.select(null);sessionStorage.setItem('rtl-source-transition',JSON.stringify({workflowId:next.id,mode:next.mode,state:next.state,selection}));location.reload();}
  async function operate(operation){if(busy||reloading)return;busy=true;error='';render();try{const result=await operation();if(result?.workflow){const changed=workflow&&workflow.state!==result.workflow.state;workflow=result.workflow;if(changed&&['Applied','Rolled Back'].includes(workflow.state)){reloadTransition(workflow);return}}}catch(e){error=e.message;if(workflow?.id){try{const current=await api(endpoint+'/'+workflow.id);if(current.workflow){const changed=workflow.state!==current.workflow.state;workflow=current.workflow;if(changed&&['Applied','Rolled Back'].includes(workflow.state))reloadTransition(workflow)}}catch{}}}finally{busy=false;if(!reloading)render()}}
  const action=(name,fn,disabled=false)=>{const b=el('button',name);b.disabled=busy||disabled;b.onclick=()=>operate(fn);return b};
  const change=(f,kind,notes)=>api(endpoint+'/'+workflow.id+'/change',{findingId:f.id,action:kind,notes:notes||''});
  const rollback=()=>{if(!window.confirm('Rollback this workflow? Later user edits will block rollback.'))return;return api(endpoint+'/'+workflow.id+'/rollback',{confirmation:'ROLLBACK_CONFIRMED'})};

  const previewAttempts=new Map();let previewFlight=null;
  const previewKey=(f,c)=>[workflow?.id,d.inputDigest,d.policyDigest,f.id,c?.application,c?.routeId,workflow?.session?.runtime?.status||'not-started',workflow?.entries.filter(e=>e.applied).map(e=>e.finding.id).join(',')].join('|');
  const paintPreview=(f,state,reason='')=>embeddedReview.preparation(f,{state,reason,busy:busy||!!previewFlight});
  function retryPreview(f){if(busy||previewFlight||s.finding?.id!==f.id)return;previewAttempts.delete(previewKey(f,embeddedReview.capability(f)));embeddedReview.refresh(f);}
  async function automaticPreview(){
    const f=s.finding;if(!f||!workflow||sourceContextError||reloading)return;
    const e=workflow.entries.find(e=>e.finding.id===f.id),c=embeddedReview.capability(f);
    if(workflow.state!=='Reviewing'||!e?.patch||['Rejected','Deferred','Flagged'].includes(e.decision)){paintPreview(f,'unsupported',workflow.state!=='Reviewing'?'Historical review; current candidate preparation is unavailable.':!e?.patch?e?.reason||'Finding outside the current review scope.':e.decision+' decision; automatic preparation will not restore this patch.');return;}
    const key=previewKey(f,c),attempt=previewAttempts.get(key);
    if(attempt?.state==='failed'){paintPreview(f,'failed',attempt.reason);return;}
    if(!c?.verified&&!(e.applied&&c?.candidateAvailable&&c?.bindingVerified)){paintPreview(f,c?.blocked?'unsupported':c?.failed?'failed':'waiting',c?.reason||'Verifying the original source, route and rendered target…');return;}
    if(e.applied&&c.candidateReady){paintPreview(f,'ready');return;}
    if(e.applied&&c.candidateAvailable){
      if(c.candidateFailed){const failed={state:'failed',reason:c.candidateReason||'Candidate source/target verification failed.'};previewAttempts.set(key,failed);paintPreview(f,'failed',failed.reason);}
      else paintPreview(f,'preparing','Checking the isolated candidate source and rendered target…');
      return;
    }
    if(attempt?.state==='prepared'){const failed={state:'failed',reason:c.candidateReason||'Prepared candidate runtime is unavailable. Retry preview.'};previewAttempts.set(key,failed);paintPreview(f,'failed',failed.reason);return;}
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
  function render(){
    const f=s.finding;if(!f||!localStorage.getItem('rtl-review-workflow'))return;
    normalizeComponentReview();normalizeDecision();
    const card=document.querySelector('.decision-card'),component=document.querySelector('.component-review');if(!card)return;
    card.classList.add('workflow-owned');card.querySelectorAll('.workflow-controls').forEach(n=>n.remove());
    const actions=card.querySelector('.decision-actions');if(!actions)return;actions.replaceChildren();
    const controls=el('div','','workflow-controls');card.append(controls);
    if(sourceContextError){state((workflow?.state==='Rolled Back'||pendingSourceTransition?.state==='Rolled Back'?'Rollback succeeded. Rescan failed: ':'Source context blocked: ')+sourceContextError+'. Displayed report is a stale snapshot; current analysis is unavailable.');document.querySelector('.after-card pre').textContent='Fresh suggestion unavailable until rescan succeeds.';controls.append(el('p','Source context blocked: '+sourceContextError,'source-context-status'),action('Retry rescan',()=>{sessionStorage.setItem('rtl-source-transition',JSON.stringify(pendingSourceTransition||{mode:workflow?.mode||localStorage.getItem('rtl-review-workflow')}));reloading=true;location.reload()}));if(workflow){controls.append(el('p','Historical review · '+workflow.mode+' · '+workflow.state,'workflow-summary'));const detailsButton=el('button','Review details');detailsButton.onclick=()=>reviewDetails.open(detailsButton,null,workflow);controls.append(detailsButton);if(['Applied','Applying'].includes(workflow.state)&&workflow.receipts?.length)controls.append(action('Rollback accepted changes',rollback));}return;}
    if(error){state('Blocked: '+error);controls.append(action('Retry connection',()=>restore(true)));}
    if(!workflow){if(!error)state(busy?'Analyzing scan and codemod inventory…':'Start a review workflow to analyze this report.');return;}
    const historical=workflow.state!=='Reviewing',e=historical?null:workflow.entries.find(e=>e.finding.id===f.id),locked=historical;
    reviewDetails.update(historical?null:workflow,historical?workflow:history);
    const selected=workflow.entries.filter(e=>e.decision==='Accepted').length;
    controls.append(el('p',workflow.mode+' · Scope: '+(workflow.scope.length?workflow.scope.length+' files':'all scanned files')+' · '+selected+' accepted · '+workflow.state,'workflow-summary'));
    const feedbackKey='rtl-rollback-feedback:'+workflow.id;
    if(workflow.resumedFrom&&!historical&&!workflow.validation&&workflow.entries.every(e=>e.decision==='Pending'&&!e.history.length)&&!sessionStorage.getItem(feedbackKey)){const feedback=el('p','Rollback succeeded · Automatic rescan complete · Fresh review ready. ','source-context-status');const dismiss=el('button','Dismiss');dismiss.setAttribute('aria-label','Dismiss rollback notification');dismiss.onclick=()=>{sessionStorage.setItem(feedbackKey,'dismissed');render()};feedback.append(dismiss);controls.append(feedback);}

    if(historical){['Approve fix','Reject fix','Defer','Needs review'].forEach(label=>actions.append(action(label,()=>{},true)));controls.append(el('p',workflow.state==='Rolled Back'?'Source restored · Start a fresh review.':workflow.state==='Applying'?'Source apply incomplete · Use Rollback to recover. History: Review details.':'Source applied · Current source shown. History and recovery: Review details.','source-context-status'));document.querySelector('.after-card pre').textContent='Current source · No current candidate. '+((f.eligibilityBlockers||[]).join('; ')||'Review this finding separately.');}if(sourceContextError)controls.append(el('p','Source context blocked: '+sourceContextError,'source-context-status'));
    if(e){
      document.querySelector('.before-card pre').textContent=e.finding.original;
      document.querySelector('.after-card pre').textContent=e.patch?e.patch.replacement:'No supported automatic fix. '+e.reason;
      if(!error)state(e.decision+' · '+(e.applied?'Applied to candidate':'Not applied to candidate')+' · '+e.reason);
      const notes=el('textarea');notes.placeholder='Reviewer notes';notes.maxLength=4000;notes.setAttribute('aria-label','Workflow reviewer notes');notes.value=e.notes;const noteBox=el('details','','workflow-notes');noteBox.append(el('summary','Reviewer notes'+(e.notes?' · Saved':'')),notes,action('Save notes',()=>change(f,'notes',notes.value)));controls.append(noteBox);
      actions.append(action('Approve fix',()=>change(f,'Accepted',notes.value),locked||!e.patch||!e.applied));
      actions.append(action('Reject fix',()=>change(f,'Rejected',notes.value),locked));
      actions.append(action('Defer',()=>change(f,'Deferred',notes.value),locked));
      actions.append(action('Needs review',()=>change(f,'Flagged',notes.value),locked));
      if(e.patch){const apply=el('button','Preparing preview…');apply.disabled=true;apply.dataset.candidateAction='true';apply.dataset.automaticPreview='true';apply.onclick=()=>retryPreview(f);controls.append(apply);}
      embeddedReview.configure(f,{...(e.patch?{patch:e.patch,onApply:()=>operate(async()=>{const result=await change(f,'apply');previewAttempts.clear();return result;})}:{}),workflow});
      const previewButton=[...card.querySelectorAll('button')].find(b=>['Apply & Preview','Prepare candidate','Open candidate preview','Retry candidate preview'].includes(b.textContent));if(previewButton)previewButton.disabled=busy||locked;
    }else{if(!error)state(historical?'Current source · No current candidate · Validation Not run. History: Review details.':'Finding outside selected workflow scope.');embeddedReview.configure(f,{workflow});}
    const operations=el('div','','actions workflow-operations');const detailsButton=el('button','Review details');detailsButton.onclick=()=>reviewDetails.open(detailsButton,historical?null:workflow,historical?workflow:history);controls.append(detailsButton);
    operations.append(action('Validate accepted changes',()=>api(endpoint+'/'+workflow.id+'/validate',{}),locked||!selected));
    operations.append(action('Apply accepted changes to source',()=>{if(!window.confirm('Apply only explicitly accepted, validated changes to the original source? Recoverable backups will be retained.'))return;return api(endpoint+'/'+workflow.id+'/apply',{confirmation:'APPLY_CONFIRMED'})},!['Reviewing','Applying'].includes(workflow.state)||workflow.validation?.state!=='Passed'));
    operations.append(action('Rollback accepted changes',rollback,!['Applied','Applying'].includes(workflow.state)||!workflow.receipts?.length));
    if(workflow.state==='Rolled Back'||workflow.resumedFrom&&!workflow.session)operations.append(action('Start new review',()=>api(endpoint,{inputDigest:d.inputDigest,policyDigest:d.policyDigest,mode:workflow.mode,scope:workflow.scope,restart:true})));controls.append(operations);
    const validation=el('p','Current review · '+(e?.decision||'Pending')+' · Technical validation: '+(historical?'Not run':workflow.validation?.state||'Not run'),'workflow-validation current-review-status workflow-decision');controls.append(validation);
    // These legacy one-patch operations remain available to API regressions; this workflow owns its distinct lifecycle.
    card.querySelectorAll('.reviewer-context,.apply-advanced').forEach(n=>n.hidden=true);
  }
  async function restore(create=false,mode=localStorage.getItem('rtl-review-workflow')){
    if(!mode)return;const result=await api(pendingSourceTransition?.workflowId?endpoint+'/'+pendingSourceTransition.workflowId:endpoint+'?'+new URLSearchParams({inputDigest:dashboardSnapshot.inputDigest,policyDigest:dashboardSnapshot.policyDigest,mode}));
    if(result.workflow){workflow=result.workflow;scope=workflow.scope;if(!sourceContextError&&workflow.state==='Rolled Back'){history=workflow;const next=await api(endpoint+'/'+workflow.id+'/resume',{});workflow=next.workflow;pendingSourceTransition=null;return next;}if(workflow.resumedFrom)history=(await api(endpoint+'/'+workflow.resumedFrom)).workflow;if(!sourceContextError)pendingSourceTransition=null;return result;}
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
