/** Dashboard operation dialogs share the persisted workflow operation identity. */
export const operationFlowClientSource=String.raw`
  const operationKey='rtl-review-operation',operationStyle=el('style');operationStyle.textContent='.review-operation{box-sizing:border-box;width:min(520px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;border:1px solid #a681e8;border-radius:12px;background:#12213a;color:#f4f7ff;padding:22px}.review-operation::backdrop{background:#050a16b8}.review-operation .actions{display:flex;flex-wrap:wrap;gap:10px}.review-operation button{padding:10px 14px;background:#6330af;color:white;border:1px solid #ad8add;border-radius:6px}.review-operation code{display:block;overflow-wrap:anywhere;white-space:pre-wrap}.review-operation [role=status]{font-weight:700}.operation-spinner{display:block;width:36px;height:36px;border:4px solid var(--theme-line,#526d91);border-top-color:var(--theme-focus,#cfb0ff);border-radius:50%;animation:rtl-operation-spin .8s linear infinite;margin:0 0 14px}@keyframes rtl-operation-spin{to{transform:rotate(360deg)}}.operation-success{color:#55dc9e;font-size:30px}@media(prefers-reduced-motion:reduce){.review-operation,.operation-spinner{animation:none;transition:none}}';document.head.append(operationStyle);
  let operationDialog=null,uncertainOperation=null;
  function dismissOperation(){operationDialog?.close();operationDialog?.remove();operationDialog=null;r.inert=false;document.querySelector('.finding-title')?.focus({preventScroll:true});}
  function operationWindow(title,description,locked=false){dismissOperation();const dialog=document.createElement('dialog');dialog.className='review-operation';dialog.setAttribute('aria-labelledby','operation-title');dialog.setAttribute('aria-describedby','operation-description');const heading=el('h2',title);heading.id='operation-title';const copy=el('p',description);copy.id='operation-description';copy.setAttribute('role',locked?'status':'note');if(locked)copy.setAttribute('aria-live','polite');if(locked){const spinner=el('span','','operation-spinner');spinner.setAttribute('aria-hidden','true');dialog.append(spinner)}dialog.append(heading,copy);dialog.addEventListener('cancel',event=>{event.preventDefault();if(!locked)dismissOperation()});document.body.append(dialog);operationDialog=dialog;r.inert=true;dialog.showModal();return dialog;}
  const opButton=(dialog,label,fn)=>{let actions=dialog.querySelector('.actions');if(!actions){actions=el('div','','actions');dialog.append(actions)}const button=el('button',label);button.onclick=fn;actions.append(button);return button;};
  const acceptedEntries=()=>workflow?.entries.filter(e=>e.decision==='Accepted'&&e.applied&&e.patch)||[];
  function applyConfirmation(){
    if(busy||uncertainOperation||!workflow?.applyEligibility?.eligible)return;
    const entries=acceptedEntries(),dialog=operationWindow('Apply changes to source','Confirmation writes '+entries.length+' accepted and validated changes to original source files. Rejected, deferred, Needs review and unaccepted findings are excluded.');
    dialog.append(el('h3','Destination project'),el('code',workflow.root),el('h3','Affected files'));for(const path of [...new Set(entries.map(e=>e.finding.path))])dialog.append(el('code',path));dialog.append(el('p','Apply creates receipt-backed recoverable backups. Protected rollback refuses later source edits.'));
    opButton(dialog,'Apply to source',()=>{dismissOperation();runDashboardOperation('apply')});opButton(dialog,'Cancel',dismissOperation).focus();
  }
  function operationResult(op){
    if(!op)return;
    const applied=op.kind==='apply'&&workflow.state==='Applied'&&op.state==='Succeeded',passed=op.kind==='validate'&&op.state==='Succeeded'&&workflow.applyEligibility?.eligible;
    const title=applied?'Changes applied':passed?'Validation passed':op.state==='Uncertain'||op.state==='Running'?'Operation status uncertain':op.kind==='validate'?'Validation did not pass':'Apply did not complete';
    const message=applied?op.count+' accepted changes applied to original source. Current scan and historical operation are separate.':passed?op.count+' changes validated. Your original source files have not changed.':op.error||workflow.applyEligibility?.reason||'The request may have executed. Reconcile its server operation record before any retry.';
    const dialog=operationWindow(title,message);if(applied||passed){const icon=el('span','✓','operation-success');icon.setAttribute('role','img');icon.setAttribute('aria-label','Success');dialog.prepend(icon)}
    if(applied){
      opButton(dialog,'View applied changes / operation details',()=>{dismissOperation();document.querySelector('[data-review-details]')?.click()});
      opButton(dialog,'Start review of remaining findings',()=>{dismissOperation();startRemainingReview()});
      if(workflow.receipts?.length)opButton(dialog,'Rollback applied changes',()=>{dismissOperation();operate(rollback,'Rollback applied changes')});
    }else if(passed)opButton(dialog,'Apply '+op.count+' changes…',()=>{dismissOperation();applyConfirmation()});
    else if(op.state==='Failed'&&workflow.state==='Reviewing')opButton(dialog,'Retry',()=>{dismissOperation();runDashboardOperation(op.kind)});
    else if(op.state==='Uncertain'||op.state==='Running')opButton(dialog,'Check operation status',()=>reconcileOperation(op));
    const back=opButton(dialog,'Back to review',dismissOperation);if(passed||applied)dialog.querySelector('.actions button')?.focus();else back.focus();
  }
  async function reconcileOperation(pending){
    busy=true;busyLabel='Checking operation status';operationWindow('Checking operation status','The previous request may have executed. Checking the authoritative server record…',true);
    try{const result=await api(endpoint+'/'+pending.workflowId),next=result.workflow;if(next?.id!==pending.workflowId)throw Error('OPERATION_SESSION_IDENTITY_MISMATCH');workflow=next;const op=next.operations?.find(o=>o.id===pending.id&&o.kind===pending.kind);if(!op)throw Error('Operation is not yet confirmed by the server. Retry status check; no duplicate mutation was submitted.');uncertainOperation=['Uncertain','Running'].includes(op.state)?pending:null;busy=false;if(op.kind==='apply'&&next.state==='Applied'&&op.state==='Succeeded'){reloadTransition(next);return}if(!uncertainOperation)sessionStorage.removeItem(operationKey);render();operationResult(op);}
    catch(e){uncertainOperation=pending;busy=false;render();operationResult({...pending,state:'Uncertain',error:e.message+' The request may have executed; source state is not assumed.'});}
  }
  async function runDashboardOperation(kind){
    if(busy||reloading||uncertainOperation||!workflow)return;
    document.querySelector('.review-summary-dialog')?.remove();const pending={id:crypto.randomUUID(),kind,workflowId:workflow.id},count=acceptedEntries().length;
    sessionStorage.setItem(operationKey,JSON.stringify(pending));busy=true;busyLabel=kind==='validate'?'Validating changes':'Applying changes';render();operationWindow(kind==='validate'?'Validating accepted changes':'Applying accepted changes',(kind==='validate'?'Validating ':'Applying ')+count+' accepted changes…',true);
    try{const result=await api(endpoint+'/'+pending.workflowId+'/'+kind,{operationId:pending.id,...(kind==='apply'?{confirmation:'APPLY_CONFIRMED'}:{})});if(result.workflow?.id!==pending.workflowId)throw Error('OPERATION_SESSION_IDENTITY_MISMATCH');workflow=result.workflow;const op=workflow.operations?.find(o=>o.id===pending.id&&o.kind===kind);if(!op)throw Error('Operation receipt unavailable.');busy=false;dismissOperation();if(kind==='apply'&&workflow.state==='Applied'){reloadTransition(workflow);return}sessionStorage.removeItem(operationKey);render();operationResult(op);}
    catch(e){await reconcileOperation(pending);}
  }
  async function startRemainingReview(){
    await operate(async()=>{const result=await api(endpoint+'/'+workflow.id+'/remaining',{});for(const e of result.workflow.entries){const old=e.carriedFrom,draft=old&&noteDrafts.get(old.workflowId+':'+old.findingId);if(draft)rememberDraft(result.workflow.id+':'+e.finding.id,draft)}return result},'Start review of remaining findings');
    sessionStorage.removeItem(operationKey);pendingSourceTransition=null;render();
  }
  function recoverOperationResult(){let pending;try{pending=JSON.parse(sessionStorage.getItem(operationKey)||'null')}catch{}if(pending?.workflowId===workflow?.id){document.querySelector('.workflow-screen')?.remove();app.hidden=false;document.body.style.overflow='';window.rtlEntryPending=false;const op=workflow.operations?.find(o=>o.id===pending.id&&o.kind===pending.kind);if(op&&['Succeeded','Failed'].includes(op.state)){sessionStorage.removeItem(operationKey);operationResult(op)}else reconcileOperation(pending)}}
`;
