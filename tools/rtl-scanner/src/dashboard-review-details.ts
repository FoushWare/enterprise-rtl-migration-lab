/** Read-only view of the workflow snapshots. Opening or navigating never calls an API. */
export const reviewDetailsClientSource = String.raw`
const reviewDetails=(()=>{
  let dialog=null,opener=null,scope='current',tab='Activity',snapshot=null;
  const labels=['Activity','Validation','Changes','Technical'];
  function close(){if(!dialog)return;dialog.close();dialog.remove();dialog=null;if(opener?.isConnected)opener.focus({preventScroll:true})}
  function disclosure(title,text,cls=''){const node=el('details','',cls);node.append(el('summary',title),el('pre',text));return node}
  function render(){
    if(!dialog)return;const body=dialog.querySelector('.review-details-body');body.replaceChildren();
    dialog.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===scope)));
    dialog.querySelectorAll('[role=tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.textContent===tab));b.tabIndex=b.textContent===tab?0:-1});
    const w=scope==='history'?snapshot.history:snapshot.current;
    body.setAttribute('aria-labelledby','review-tab-'+tab.toLowerCase());
    if(scope==='history')body.append(el('p','Historical results do not validate the current review.','history-warning'));
    if(!w){body.append(el('p',scope==='history'?'No previous review.':'No active current review. Decisions Pending · validation Not run.'));return}
    body.append(el('p',(scope==='history'?'Historical review':'Current review')+' · '+w.mode+' · '+w.state,'review-details-summary'));
    if(tab==='Activity'){
      const events=[{at:w.createdAt,label:'Review started · '+w.mode}];
      if(w.resumedFrom)events.push({at:w.createdAt,label:'Fresh analysis resumed after rollback · no inherited decisions or validation'});
      for(const e of w.entries)for(const h of e.history)events.push({at:h.at,label:e.finding.path+' · '+h.decision+(h.notes?' · '+h.notes:'')});
      if(w.validation)events.push({at:w.validation.at,label:'Validation '+w.validation.state});
      for(const receipt of w.receipts||[])events.push({at:receipt.appliedAt||receipt.timestamp||'',label:'Applied to source · '+receipt.path});
      const list=el('ol','','review-activity');for(const event of events.sort((a,b)=>a.at.localeCompare(b.at)))list.append(el('li',event.label+(event.at?' · '+event.at:'')));
      if(w.state==='Rolled Back')list.append(el('li','Rollback completed · Source restored; new review required.'));
      body.append(list);
    }else if(tab==='Validation'){
      const validation=el('div','','dialog-validation');validation.append(el('p','Technical validation: '+(w.validation?.state||'Not run')));
      for(const check of w.validation?.checks||[])validation.append(disclosure(check.name+': '+check.state,check.detail));body.append(validation);
    }else if(tab==='Changes'){
      const inventory=el('div','','workflow-inventory');inventory.append(el('p','Change inventory · '+w.entries.filter(e=>e.patch).length+' supported / '+w.entries.length+' findings'));
      for(const file of w.files){const block=el('details');block.append(el('summary',file.path));for(const e of w.entries.filter(e=>e.finding.path===file.path))block.append(el('p',e.finding.range.start.line+':'+e.finding.range.start.column+' · '+e.decision+' · '+(e.applied?'Applied to candidate':'Not applied')+' · '+e.reason),el('pre',e.patch?'- '+e.finding.original+'\n+ '+e.patch.replacement:'Unchanged: no supported fix'));block.append(disclosure('File diff',file.diff,'workflow-file-diff'));inventory.append(block)}body.append(inventory);
    }else{
      if(scope==='history')body.append(el('p','Current analysis '+d.inputDigest+' · Not validated by this historical review. Historical analysis '+w.inputDigest+' · '+w.state+'. Historical Before preview unavailable: no immutable application runtime was retained. Current source is shown in the preview; decisions, validation, receipts and backups remain historical.','historical-context'));
      body.append(disclosure('Review identities and hashes',JSON.stringify({id:w.id,resumedFrom:w.resumedFrom,root:w.root,inputDigest:w.inputDigest,policyDigest:w.policyDigest,previewConfigDigest:w.previewConfigDigest,session:w.session,files:w.files.map(f=>({path:f.path,originalSha256:f.originalSha256,candidateSha256:f.candidateSha256})),validation:w.validation?{signature:w.validation.signature,hashes:w.validation.hashes}:null},null,2)));
      body.append(disclosure('Receipts and backups',JSON.stringify(w.receipts||[],null,2),'workflow-receipts'));
    }
  }
  function open(button,current,history){
    if(dialog)close();opener=button;snapshot={current,history};scope='current';tab='Activity';
    dialog=document.createElement('dialog');dialog.className='review-details-dialog';dialog.setAttribute('aria-labelledby','review-details-title');
    const header=el('header');header.append(el('h2','Review details'));header.firstChild.id='review-details-title';const x=el('button','Close');x.setAttribute('aria-label','Close review details');x.onclick=close;header.append(x);
    const scopes=el('div','','review-details-scopes');scopes.setAttribute('role','group');scopes.setAttribute('aria-label','Review period');for(const [value,label] of [['current','Current review'],['history','History']]){const b=el('button',label);b.dataset.scope=value;b.onclick=()=>{scope=value;render()};scopes.append(b)}
    const tabs=el('div','','review-details-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Review details sections');for(const label of labels){const b=el('button',label);b.id='review-tab-'+label.toLowerCase();b.setAttribute('role','tab');b.setAttribute('aria-controls','review-details-panel');b.onclick=()=>{tab=label;render()};b.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();tab=event.key==='Home'?labels[0]:event.key==='End'?labels[3]:labels[(labels.indexOf(tab)+(event.key==='ArrowRight'?1:3))%4];render();tabs.querySelector('[aria-selected=true]').focus()};tabs.append(b)}
    const body=el('div','','review-details-body');body.id='review-details-panel';body.setAttribute('role','tabpanel');body.tabIndex=0;dialog.append(header,scopes,tabs,body);document.body.append(dialog);dialog.addEventListener('cancel',event=>{event.preventDefault();close()});dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const nodes=[...dialog.querySelectorAll('button,[tabindex="0"],summary')].filter(n=>!n.disabled&&n.getClientRects().length);if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===nodes.at(-1)){event.preventDefault();nodes[0].focus()}});render();dialog.showModal();x.focus();
  }
  const style=el('style');style.textContent='.review-details-dialog{box-sizing:border-box;width:min(900px,calc(100vw - 24px));height:min(720px,calc(100dvh - 24px));max-width:none;max-height:none;padding:20px;border:1px solid #547297;border-radius:14px;background:linear-gradient(180deg,#14243b,#0e1a2d);color:#e7eefb;font:13px/1.5 Inter,system-ui,sans-serif;overflow:hidden}.review-details-dialog[open]{display:flex;flex-direction:column;gap:12px}.review-details-dialog::backdrop{background:#020916b8}.review-details-dialog header{display:flex;align-items:center;justify-content:space-between;gap:10px}.review-details-dialog h2{margin:0;font-size:20px}.review-details-dialog button{padding:8px 14px;border:1px solid #547297;border-radius:7px;background:#142944;color:#e7eefb;font:inherit;cursor:pointer}.review-details-dialog button:focus-visible,.review-details-dialog summary:focus-visible,.review-details-body:focus-visible{outline:2px solid #d5b2ff;outline-offset:2px}.review-details-scopes,.review-details-tabs{display:flex;gap:6px;flex-shrink:0}.review-details-scopes button,.review-details-tabs button{flex:1}.review-details-dialog [aria-selected=true],.review-details-dialog [aria-pressed=true]{background:#6534aa;border-color:#be92ff}.review-details-body{overflow:auto;overscroll-behavior:contain;min-height:0;flex:1;padding:4px 8px}.review-details-body pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;max-height:300px;overflow:auto;padding:10px;background:#0a1729;border-radius:6px}.review-details-body details{margin:9px 0;border:1px solid #385579;border-radius:7px;padding:9px}.review-details-body summary{cursor:pointer}.history-warning{padding:9px;background:#26384f;border-radius:7px}.review-activity li{margin:12px 0}.workflow-notes summary{cursor:pointer;color:#cdb7ff}.workflow-notes textarea{margin-top:7px}.workflow-operations{display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid #385579;padding-top:8px;margin-top:8px}.workflow-controls .workflow-validation{max-height:none}.workflow-controls>button,.workflow-notes button{min-height:32px;margin:6px 6px 2px 0;padding:6px 12px;border:1px solid #6d7e9a;border-radius:7px;background:#142944;color:#e7eefb;font:600 11px Inter,system-ui;cursor:pointer}.workflow-controls>[data-candidate-action]{background:linear-gradient(180deg,#7440d1,#4f209c);border-color:#a477f5}.workflow-controls button:disabled{opacity:.52}.workflow-controls button:focus-visible{outline:2px solid #d5b2ff;outline-offset:2px}.workflow-owned .decision-actions [data-candidate-action]{flex:0 0 auto}.workflow-owned .decision-actions button:last-child:not([data-candidate-action]){background:#102039;border-color:#385579}.workflow-summary,.workflow-decision{margin:5px 0}.workflow-owned .source-context-status{font-size:10px;color:#aebed3}@media(max-width:520px){.review-details-dialog{padding:12px}.review-details-dialog button{padding:7px;font-size:12px}.review-details-tabs{gap:3px}.workflow-owned .decision-actions{flex-wrap:wrap}}';document.head.append(style);
  function update(current,history){if(dialog&&(snapshot.current!==current||snapshot.history!==history)){snapshot={current,history};render()}}
  return{open,close,update};
})();
`;
