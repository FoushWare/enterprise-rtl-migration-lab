/** Read-only views of snapshots captured by the session coordinator. */
export const reviewDetailsClientSource = String.raw`
const reviewDetails=(()=>{
  let dialog=null,opener=null,scope='current',tab='Activity',snapshot=null,historyId=null;
  const labels=['Activity','Validation','Changes','Technical'],icons=['activity','check','code','layers'];
  const paths={document:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',activity:'<path d="m3 16 5-6 7 4 6-8"/><circle cx="3" cy="16" r="1.5"/><circle cx="8" cy="10" r="1.5"/><circle cx="15" cy="14" r="1.5"/><circle cx="21" cy="6" r="1.5"/>',check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',code:'<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/>',layers:'<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',history:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l4 2"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>',warning:'<path d="m12 3 10 18H2Zm0 6v5m0 3v1"/>',start:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/>',reject:'<circle cx="12" cy="12" r="9"/><path d="m8 8 8 8m0-8-8 8"/>',note:'<path d="M4 3h16v14h-9l-5 4v-4H4Zm4 5h8m-8 4h5"/>',rollback:'<path d="m8 4-6 6 6 6m-6-6h12a6 6 0 0 1 0 12"/>'};
  function glyph(name,cls=''){const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('class','review-icon '+cls);icon.setAttribute('aria-hidden','true');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.7');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');icon.innerHTML=paths[name]||paths.info;return icon;}
  function stamp(at){const node=el('time',at);const date=new Date(at);if(!Number.isNaN(date.valueOf())){node.dateTime=at;node.textContent=date.toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});node.title=date.toLocaleString()+' · '+at;}return node;}
  const histories=()=>{const list=Array.isArray(snapshot.history)?snapshot.history:snapshot.history?[snapshot.history]:[];return list.filter((w,i)=>w&&list.findIndex(other=>other?.id===w.id)===i)};
  function close(){if(!dialog)return;dialog.close();dialog.remove();dialog=null;const target=opener?.isConnected?opener:document.querySelector('[data-review-details]');target?.focus({preventScroll:true})}
  function disclosure(title,text,cls=''){const node=el('details','',cls);node.append(el('summary',title),el('pre',text));return node}
  function field(list,label,value){const content=el('dd'),text=el('span',value||'Not recorded');content.append(text);if(value&&['Review','Project root','Candidate session','Resumed from','Superseded by','Analysis hash','Policy hash'].includes(label)){const copy=el('button','Copy');copy.type='button';copy.setAttribute('aria-label','Copy '+label.toLowerCase());copy.onclick=async()=>{try{await navigator.clipboard.writeText(String(value));copy.textContent='Copied'}catch{copy.textContent='Select value';const selection=getSelection(),range=document.createRange();range.selectNodeContents(text);selection.removeAllRanges();selection.addRange(range)}};content.append(copy)}list.append(el('dt',label),content)}
  const time=at=>{const date=new Date(at);return Number.isNaN(date.valueOf())?'Time not recorded':date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})};
  function render(){
    if(!dialog)return;const body=dialog.querySelector('.review-details-body');body.replaceChildren();
    dialog.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===scope)));
    dialog.querySelectorAll('[role=tab]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===tab));b.tabIndex=b.dataset.tab===tab?0:-1});
    const records=histories(),w=scope==='history'?(records.find(w=>w.id===historyId)||records.find(w=>w.supersededBy===snapshot.current?.id)||records[0]):snapshot.current;
    body.setAttribute('aria-labelledby','review-tab-'+tab.toLowerCase());
    const picker=dialog.querySelector('.review-history-select');picker.hidden=scope!=='history'||!records.length;picker.replaceChildren(...records.map(w=>new Option(time(w.createdAt)+' · '+(w.mode==='apply-first'?'Prepare all, then review':'Review one by one')+' · '+w.state+' · '+w.id.slice(0,8),w.id)));if(w&&scope==='history')picker.value=w.id;
    dialog.querySelector('.review-header-summary').textContent='Current review and previous activity';
    if(!w){body.append(el('p',scope==='history'?'No previous review.':'No active current review. Decisions Pending · validation Not run.'));return}
    const summary=el('div','','review-details-summary'),summaryText=el('div','','review-summary-text'),summaryHeading=el('div','','review-summary-heading');
    const badgeLabel=scope==='history'&&w.state==='Rolled Back'?'Rolled back':scope==='history'&&w.supersededBy?'Superseded':w.state;
    const badge=el('span',badgeLabel,'review-state-badge');badge.dataset.state=w.state;
    summaryHeading.append(el('strong',scope==='history'?'Previous review':'Current review'),badge);
    const accepted=w.entries.filter(e=>e.decision==='Accepted').length,files=[...new Set(w.entries.filter(e=>e.decision==='Accepted').map(e=>e.finding.path))];
    summaryText.append(summaryHeading,el('p',accepted+' accepted '+(accepted===1?'change':'changes')+' · '+(files.length?files.map(path=>path.split('/').pop()).slice(0,2).join(', ')+(files.length>2?' +'+(files.length-2)+' files':''):(w.mode==='one-by-one'?'One by one':'Prepare all, then review'))));
    summary.append(glyph(scope==='history'?'history':'document','review-summary-icon'),summaryText);body.append(summary);
    if(scope==='history'){
      const warning=el('div','','history-warning');
      warning.append(glyph('warning','history-warn-icon'),document.createTextNode('\u00a0Historical results do not validate the current review.'));
      body.append(warning);
      // An applied review in history offers its rollback here, through the same rollback as the review controls (confirmation and server checks apply).
      if(w.state==='Applied'&&w.receipts?.length){const rollbackButton=el('button','Rollback applied changes');rollbackButton.type='button';rollbackButton.className='review-btn-secondary';rollbackButton.onclick=()=>{close();window.rtlRollbackReview?.(w.id)};body.append(rollbackButton);}
    }
    if(tab==='Activity'){
      const events=[{at:w.createdAt,label:'Review started',detail:w.mode==='one-by-one'?'One by one review':'Prepare all, then review',icon:'start',tone:'neutral'}];
      if(w.resumedFrom)events.push({at:w.createdAt,label:'Fresh analysis resumed after rollback',detail:'No inherited decisions or validation',icon:'history',tone:'neutral'});
      for(const e of w.entries)for(const h of e.history)events.push({at:h.at,label:h.decision,detail:e.finding.path+':'+e.finding.range.start.line+(h.notes?' · '+h.notes:''),icon:h.decision==='Accepted'?'check':h.decision==='Rejected'?'reject':'note',tone:h.decision==='Accepted'?'success':h.decision==='Rejected'?'error':'neutral'});
      if(w.validation){const status=w.validationPresentation?.status||w.validation.state;events.push({at:w.validation.at,label:'Validation · '+status,detail:w.validationPresentation?.explanation||'Historical recorded results',icon:status==='Passed'?'check':status==='Limited validation'?'warning':status==='Failed'?'reject':'info',tone:status==='Passed'?'success':status==='Limited validation'?'warning':status==='Failed'?'error':'neutral'});}
      for(const receipt of w.receipts||[])events.push({at:receipt.appliedAt||receipt.timestamp||'',label:'Applied to source',detail:receipt.path,icon:'layers',tone:'applied'});
      if(w.state==='Rolled Back')events.push({at:w.rolledBackAt||'',label:'Rollback completed',detail:'Source restored. New review required.',icon:'rollback',tone:'warning'});
      const list=el('ol','','review-activity');for(const event of events.sort((a,b)=>(a.at||'~').localeCompare(b.at||'~'))){const row=el('li'),icon=el('span','','activity-icon'),text=el('div','','activity-text');row.dataset.tone=event.tone;icon.append(glyph(event.icon));text.append(el('strong',event.label),el('p',event.detail));row.append(icon,text,stamp(event.at));list.append(row)}body.append(list);
      if(w.receipts?.length)body.append(disclosure('Receipts and backups',JSON.stringify(w.receipts,null,2),'workflow-receipts'));
    }else if(tab==='Validation'){
      const presentation=w.validationPresentation,validation=el('div','','dialog-validation'),status=presentation?.status||w.validation?.state||'Not run';validation.dataset.status=status;
      validation.append(el('h3','Technical validation: '+status));
      // Limited validation amber banner
      if(status==='Limited validation'){const banner=el('div','','validation-limited-banner');banner.append(glyph('warning','validation-warn-icon'),document.createTextNode('\u00a0Available checks passed · Limited validation'));validation.append(banner);}
      if(presentation?.explanation)validation.append(el('p',presentation.explanation));
      // Check table with distinguishable groups (Project, Scanner, Runtime)
      const allChecks=presentation?.checks||w.validation?.checks||[];
      const isScanner=c=>c.kind==='scanner'||c.name==='scanner';
      const isRuntime=c=>c.kind==='runtime'||c.name.startsWith('runtime');
      const isProject=c=>c.kind==='project'||(!c.kind&&!isScanner(c)&&!isRuntime(c));
      const projectChecks=allChecks.filter(isProject);
      const scannerChecks=allChecks.filter(isScanner);
      const runtimeChecks=allChecks.filter(isRuntime);
      const groups=[
        {title:'Project checks',checks:projectChecks,isProject:true},
        {title:'Scanner verification',checks:scannerChecks,isProject:false},
        {title:'Runtime verification',checks:runtimeChecks,isProject:false}
      ].filter(g=>g.checks.length>0);
      if(groups.length){
        const table=el('div','','validation-table');
        const headRow=el('div','','validation-head-row');headRow.append(el('span','Check'),el('span','Result'),el('span','Scope'));table.append(headRow);
        for(const group of groups){
          const groupRow=el('div','','validation-group-row');groupRow.append(el('span',group.title,'validation-group-title'));table.append(groupRow);
          for(const check of group.checks){
            const row=el('div','','validation-row '+(group.isProject?'validation-check':'validation-extra-check'));
            row.dataset.kind=check.kind||(group.isProject?'project':'runtime');
            row.dataset.check=check.name;
            row.dataset.status=check.state;
            const stateClass=check.state==='Passed'?'badge-pass':['Failed','Error','Unavailable'].includes(check.state)?'badge-fail':check.state==='Not configured'?'badge-nc':'badge-neutral';
            const resultCell=el('span','','check-result');
            const resultBadge=el('span',check.state,'result-badge '+stateClass);resultCell.append(resultBadge);
            const nameSpan=el('span','','check-name');nameSpan.append(el('strong',check.name));
            row.append(nameSpan,resultCell,el('span',check.scope||'—','check-scope'));
            if(['Failed','Unavailable','Error'].includes(check.state)&&check.detail){
              const err=el('div',check.detail,'check-error-detail');row.append(err);
            }
            table.append(row);
          }
        }
        validation.append(table);
      }
      // Coverage notice
      const coverage=el('aside','','change-coverage');coverage.append(el('strong','Change coverage: '+(presentation?.coverage||'Unknown')),el('p',presentation?.coverageDetail||'No matching source/candidate/test-run coverage evidence. Execution coverage does not prove RTL visual correctness.'));validation.append(coverage);
      // Commands and logs disclosure
      const logLines=allChecks.map(c=>(c.name||'')+(c.command?'\n$ '+c.command:'')+(c.detail?'\n'+c.detail:'')).filter(Boolean).join('\n\n');
      validation.append(disclosure('Commands and logs',logLines||'No execution output recorded.','validation-logs'));
      if(w.applyEligibility)validation.append(el('p','Apply policy: '+w.applyEligibility.reason,'validation-policy'));
      body.append(validation);
    }else if(tab==='Changes'){
      const inventory=el('div','','workflow-inventory');inventory.append(el('p','Change inventory · '+w.entries.filter(e=>e.patch).length+' supported / '+w.entries.length+' findings'));
      for(const file of w.files){const block=el('details');block.append(el('summary',file.path));for(const e of w.entries.filter(e=>e.finding.path===file.path)){const entry=el('section','','change-entry');entry.append(el('h4',e.finding.path+':'+e.finding.range.start.line+':'+e.finding.range.start.column),el('p',e.decision+' · '+(e.applied?(e.decision==='Accepted'?'In accepted review set':'In review preview only · Pending approval'):'Not in review preview')),el('p',e.reason),el('pre',e.patch?'- '+e.finding.original+'\n+ '+e.patch.replacement:'Unchanged: no supported fix'));block.append(entry)}block.append(disclosure('Exact candidate file diff',file.diff,'workflow-file-diff'));inventory.append(block)}body.append(inventory);
    }else{
      if(scope==='history')body.append(el('p','Current analysis '+(snapshot.current?.inputDigest||d.inputDigest)+' · Not validated by this historical review. Historical analysis '+w.inputDigest+' · '+w.state+'. Historical Before preview unavailable: no immutable application runtime was retained. Current source is shown in the preview; decisions, validation, receipts and backups remain historical.','historical-context'));
      const fields=el('dl','','technical-fields');for(const [label,value] of [['Review',w.id],['Lifecycle',w.state],['Project root',w.root],['Candidate session',w.session?.id],['Resumed from',w.resumedFrom],['Superseded by',w.supersededBy],['Analysis hash',w.inputDigest],['Policy hash',w.policyDigest],['Validation recorded',w.validation?time(w.validation.at):'Not run']])field(fields,label,value);body.append(fields);
      body.append(disclosure('Review identities and hashes',JSON.stringify({id:w.id,resumedFrom:w.resumedFrom,root:w.root,inputDigest:w.inputDigest,policyDigest:w.policyDigest,previewConfigDigest:w.previewConfigDigest,session:w.session,files:w.files.map(f=>({path:f.path,originalSha256:f.originalSha256,candidateSha256:f.candidateSha256})),validation:w.validation?{signature:w.validation.signature,hashes:w.validation.hashes}:null},null,2)));
      body.append(disclosure('Receipts and backups',JSON.stringify(w.receipts||[],null,2),'workflow-receipts'));
    }
  }
  function open(button,current,history){
    if(dialog)close();opener=button;snapshot={current,history};scope='current';tab='Activity';historyId=current?.resumedFrom||null;
    dialog=document.createElement('dialog');dialog.className='review-details-dialog';dialog.setAttribute('aria-labelledby','review-details-title');
    // Header: icon + title/subtitle, × at right
    const header=el('header'),titleBlock=el('div','','review-details-title-block'),heading=el('h2','');heading.prepend(glyph('document'));const titleText=document.createElement('span');titleText.textContent='Session details';heading.append(titleText);titleBlock.append(heading,el('p','','review-header-summary'));heading.id='review-details-title';const x=el('button');x.append(glyph('close'));x.setAttribute('aria-label','Close session details');x.type='button';x.onclick=close;header.append(titleBlock,x);
    // Segmented control
    const scopes=el('div','','review-details-scopes');scopes.setAttribute('role','group');scopes.setAttribute('aria-label','Review period');for(const [value,label] of [['current','Current review'],['history','History']]){const b=el('button',label);b.type='button';b.dataset.scope=value;b.onclick=()=>{scope=value;render()};scopes.append(b)}
    // History picker
    const picker=document.createElement('select');picker.className='review-history-select';picker.setAttribute('aria-label','Historical review');picker.onchange=()=>{historyId=picker.value;render()};
    // Tabs
    const tabs=el('div','','review-details-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Session details sections');for(const [index,label] of labels.entries()){const b=el('button');b.type='button';b.setAttribute('aria-label',label);b.dataset.tab=label;const icon=glyph(icons[index]);b.append(icon,document.createTextNode('\u00a0'+label));b.id='review-tab-'+label.toLowerCase();b.setAttribute('role','tab');b.setAttribute('aria-controls','review-details-panel');b.onclick=()=>{tab=label;render()};b.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();tab=event.key==='Home'?labels[0]:event.key==='End'?labels[3]:labels[(labels.indexOf(tab)+(event.key==='ArrowRight'?1:3))%4];render();tabs.querySelector('[aria-selected=true]').focus()};tabs.append(b)}
    // Body + Footer
    const body=el('div','','review-details-body');body.id='review-details-panel';body.setAttribute('role','tabpanel');body.tabIndex=0;
    const footer=el('footer','','review-details-footer');
    const changesButton=el('button','View changes');changesButton.type='button';changesButton.className='review-btn-secondary';
    changesButton.onclick=()=>{tab='Changes';render();tabs.querySelector('[aria-selected=true]').focus();};
    const closeButton=el('button','Close');closeButton.type='button';closeButton.className='review-btn-primary';closeButton.onclick=close;
    footer.append(changesButton,closeButton);
    dialog.append(header,scopes,picker,tabs,body,footer);document.body.append(dialog);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
    dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const nodes=[...dialog.querySelectorAll('button,select,[tabindex="0"],summary')].filter(n=>!n.disabled&&n.getClientRects().length&&!n.closest('[hidden]'));if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===nodes.at(-1)){event.preventDefault();nodes[0].focus()}});
    render();dialog.showModal();x.focus();
  }
  const style=el('style');style.textContent='\n'+
/* Dialog shell */
'.review-details-dialog{box-sizing:border-box;width:min(720px,calc(100vw - 32px));max-width:720px;height:fit-content;max-height:min(640px,calc(100dvh - 36px));padding:20px 22px 16px;border:1px solid #587da9;border-radius:13px;background:linear-gradient(135deg,#112038,#0b182a);color:#e7eefb;font:13px/1.45 Inter,system-ui,sans-serif;overflow:hidden;box-shadow:0 20px 70px #0007}\n'+
'.review-details-dialog[open]{display:flex;flex-direction:column;gap:14px}.review-details-dialog::backdrop{background:#020916b8}.review-icon{display:inline-block;width:19px;height:19px;flex:none;vertical-align:middle}\n'+
/* Header */
'.review-details-dialog header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex:none}.review-details-title-block{min-width:0;flex:1}.review-details-dialog h2{display:flex;align-items:center;gap:10px;margin:0;font-size:20px;line-height:1.3;font-weight:700}.review-details-dialog h2 .review-icon{width:24px;height:24px;color:#c18df1;flex:none}.review-header-summary{margin:4px 0 0 34px;color:#acbfd8;font-size:12px}\n'+
'.review-details-dialog button{padding:7px 14px;border:1px solid #496488;border-radius:7px;background:transparent;color:#dce7f7;font:600 12px Inter,system-ui;cursor:pointer}.review-details-dialog header>button{border-color:transparent;padding:4px;min-width:30px;min-height:30px;flex:none}.review-details-dialog button:hover{background:#21334e}.review-details-dialog :focus-visible{outline:2px solid #d5b2ff;outline-offset:2px}\n'+
/* Segmented control */
'.review-details-scopes{display:flex;gap:2px;padding:2px;border:1px solid #617a9e;border-radius:9px;flex-shrink:0;align-self:stretch}.review-details-scopes button{flex:1;border:1px solid transparent;border-radius:7px;padding:7px 12px;font-size:12px;transition:background .15s,border-color .15s}.review-details-scopes [aria-pressed=true]{background:linear-gradient(160deg,#8548ce,#5726a0);border-color:#b98af3;color:#fff;box-shadow:inset 0 1px 2px #ffffff20}.review-details-scopes [aria-pressed=false]{color:#b0c4df}\n'+
/* Tabs — underline style */
'.review-details-tabs{display:flex;flex:none;border-bottom:1px solid #364d6c;gap:0}.review-details-tabs button{display:flex;justify-content:center;align-items:center;gap:6px;flex:1;border:0;border-bottom:2px solid transparent;border-radius:0;padding:8px 4px 10px;color:#bbcadf;white-space:nowrap;font:600 12px Inter,system-ui;background:transparent;transition:border-color .15s,color .15s;margin-bottom:-1px}.review-details-tabs button:hover{color:#dce7f7;background:#23334b44}.review-details-tabs [aria-selected=true]{border-bottom-color:#9b6dff;color:#f3eaff}.review-details-tabs .review-icon{width:16px;height:16px}\n'+
/* Body */
'.review-details-body{overflow:auto;overscroll-behavior:contain;min-height:0;padding:0 2px;scrollbar-gutter:stable;max-height:calc(100dvh - 280px)}.review-details-body h3{font-size:14px;margin:0 0 8px}.review-details-body h4{font-size:12px;margin:10px 0 5px}.review-details-body p{margin:5px 0;color:#b3c3d9;overflow-wrap:anywhere}\n'+
/* Summary card */
'.review-details-summary{display:flex;align-items:center;gap:14px;padding:12px 16px;margin:0 0 10px;border:1px solid #3d5a7f;border-radius:9px;background:linear-gradient(120deg,#172a43,#132238)}.review-summary-icon{width:27px;height:27px;color:#c18df1;flex:none}.review-summary-text{min-width:0;flex:1}.review-summary-heading{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.review-summary-heading strong{font-size:15px}.review-details-summary p{margin:3px 0 0;font-size:12px}\n'+
/* State badge */
'.review-state-badge{border:1px solid #8c6abe;border-radius:20px;padding:1px 9px;color:#dec8ff;font-size:11px;white-space:nowrap}.review-state-badge[data-state="Rolled Back"]{border-color:#e7ac37;background:#65451055;color:#ffd16a}.review-state-badge[data-state=Applied]{border-color:#8c6abe;background:#53327d55}\n'+
/* Footer */
'.review-details-footer{display:flex;flex:none;justify-content:flex-end;align-items:center;gap:10px;border-top:1px solid #364d6c;padding-top:12px}.review-btn-secondary{min-width:106px;border:1px solid #496488;background:transparent;color:#dce7f7}.review-btn-secondary:hover{background:#1e3252}.review-btn-primary{min-width:82px;background:linear-gradient(160deg,#8548ce,#5726a0);color:#fff;border-color:#b487eb}.review-btn-primary:hover{background:linear-gradient(160deg,#9458de,#6236b0)}\n'+
/* Pre / details */
'.review-details-body pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;max-height:240px;overflow:auto;padding:10px;background:#0a1729;border-radius:6px}.review-details-body details{margin:8px 0;border:1px solid #334c6b;border-radius:7px;padding:8px 10px}.review-details-body summary{cursor:pointer;list-style:none;font-size:12px;color:#c0d4ee}.review-details-body summary::marker,.review-details-body summary::-webkit-details-marker{display:none}.review-details-body details>summary::before{content:"▸ ";font-size:10px;color:#7a9cbf}.review-details-body details[open]>summary::before{content:"▾ "}\n'+
/* History warning — amber */
'.history-warning{display:flex;align-items:center;gap:8px;padding:9px 13px;margin:0 0 12px;background:#3d2b0a;border:1px solid #c4963d;border-radius:8px;color:#ffd166;font-size:12px}.history-warn-icon{flex:none;color:#f5c148}\n'+
/* Activity timeline */
'.review-activity{list-style:none;padding:2px 8px 0;margin:0}.review-activity li{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr) auto;column-gap:13px;padding:8px 0 16px;isolation:isolate}.review-activity li:not(:last-child):before{content:"";position:absolute;left:14px;top:30px;bottom:-7px;border-left:1px solid #526a8b;z-index:-1}.activity-icon{box-sizing:border-box;display:grid;place-items:center;width:30px;height:30px;border:1px solid #8268ac;border-radius:50%;color:#d0a9f3;background:#25304b;flex:none}.activity-icon .review-icon{width:16px;height:16px}.activity-text{min-width:0}.activity-text strong{font-size:13px}.review-activity .activity-text p{margin:2px 0 0;font-size:12px;line-height:1.45}.review-activity time{padding-top:2px;color:#a9bbd3;font-size:11px;white-space:nowrap;cursor:help}.review-activity [data-tone=success] .activity-icon{border-color:#57d99c;color:#c0f9da;background:#1c5945}.review-activity [data-tone=error] .activity-icon{border-color:#e37d8f;color:#ffb5bf;background:#562a3d}.review-activity [data-tone=warning] .activity-icon{border-color:#e0ad41;color:#ffda80;background:#624910}.review-activity [data-tone=applied] .activity-icon{border-color:#b391e8;color:#dec4ff;background:#3f2b65}\n'+
/* Validation table — compact rows */
'.dialog-validation{display:flex;flex-direction:column;gap:4px}.validation-limited-banner{display:flex;align-items:center;gap:8px;padding:9px 13px;background:#3d2b0a;border:1px solid #c4963d;border-radius:8px;color:#ffd166;font-size:13px;font-weight:600;margin-bottom:4px}.validation-warn-icon{flex:none;color:#f5c148}\n'+
'.validation-table{border:1px solid #2d4668;border-radius:8px;overflow:hidden;margin:6px 0}.validation-head-row{display:grid;grid-template-columns:minmax(120px,2fr) minmax(90px,1fr) minmax(0,2fr);gap:8px;padding:6px 10px;background:#1b304a;font-weight:700;font-size:11px;color:#8fa5c4;text-transform:uppercase;letter-spacing:.04em}\n'+
'.validation-group-row{display:flex;align-items:center;padding:5px 10px;background:#14243b;border-top:1px solid #233b5c;font-size:10px;font-weight:700;color:#91abcb;text-transform:uppercase;letter-spacing:.04em}.validation-group-row:first-of-type{border-top:none}\n'+
'.validation-row{display:grid;grid-template-columns:minmax(120px,2fr) minmax(90px,1fr) minmax(0,2fr);gap:8px;align-items:center;padding:7px 10px;border-top:1px solid #1e3151;font-size:12px}\n'+
'.check-name{overflow-wrap:anywhere;color:#dce7f7}.check-scope{overflow-wrap:anywhere;color:#8fa5c4;font-size:11px}.check-result{display:flex;align-items:center}\n'+
'.check-error-detail{grid-column:1/-1;padding:5px 8px;margin-top:2px;background:#441a2755;border:1px solid #8e3146;border-radius:5px;color:#ff9fae;font-size:11px;line-height:1.4;white-space:pre-wrap;word-break:break-word}\n'+
'.result-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap}.badge-pass{background:#1c5945;color:#5ee0a7;border:1px solid #57d99c}.badge-fail{background:#562a3d;color:#ff8193;border:1px solid #e37d8f}.badge-nc{background:#2a3a4f;color:#8fa5c4;border:1px solid #4b6384}.badge-neutral{background:#2a3348;color:#b3c3d9;border:1px solid #4a5f7a}\n'+
/* Change coverage */
'.change-coverage{padding:9px 12px;background:#1a2d44;border:1px solid #2d4668;border-radius:7px;margin:8px 0}.change-coverage strong{font-size:12px;color:#c8d9f0}.change-coverage p{font-size:11px;margin:3px 0 0}\n'+
'.validation-logs{margin:6px 0}.validation-policy{font-size:11px;color:#8fa5c4;margin:6px 0;padding:6px 10px;background:#1a2d44;border-radius:6px}\n'+
/* Technical fields */
'.technical-fields dd button{margin-left:8px;padding:2px 6px;font-size:10px}.technical-fields{display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px}.technical-fields dt{color:#8fa7c6}.technical-fields dd{margin:0;overflow-wrap:anywhere}.historical-context{font-size:11px;color:#8fa5c4;padding:8px 10px;background:#1a2d44;border-radius:6px;margin-bottom:8px}\n'+
/* History select */
'.review-history-select{width:100%;min-width:0;flex:none;background:#172a43;color:#e7eefb;border:1px solid #496488;padding:7px;border-radius:6px;font:12px Inter,system-ui}.review-history-select[hidden]{display:none}\n'+
/* Workflow helpers */
'.workflow-notes summary{cursor:pointer;color:#cdb7ff}.workflow-notes textarea{margin-top:7px}.workflow-controls>button,.workflow-notes button{min-height:32px;margin:6px 6px 2px 0;padding:6px 12px;border:1px solid #6d7e9a;border-radius:7px;background:#142944;color:#e7eefb;font:600 11px Inter,system-ui;cursor:pointer}.workflow-controls button:disabled{opacity:.52}.workflow-summary,.workflow-decision{margin:5px 0}.workflow-owned .source-context-status{font-size:10px;color:#aebed3}\n'+
/* Narrow layout */
'@media(max-width:480px){.review-details-dialog{width:100%;max-width:100%;border-radius:0;border-left:0;border-right:0;padding:14px 12px 12px;max-height:100dvh}}\n'+
'@media(max-width:520px){.review-details-dialog[open]{gap:10px}.review-details-dialog h2{font-size:17px}.review-details-tabs button{font-size:11px;gap:4px;padding:7px 2px 10px}.review-details-tabs .review-icon{width:14px;height:14px}.review-details-summary{padding:10px;gap:9px}.review-summary-heading strong{font-size:14px}.review-activity{padding:0 2px}.review-activity li{grid-template-columns:28px minmax(0,1fr);column-gap:10px;padding-bottom:12px}.review-activity time{grid-column:2;padding-top:3px}.review-activity li:not(:last-child):before{left:14px;bottom:-3px}.technical-fields{grid-template-columns:1fr}.technical-fields dd{margin-bottom:8px}.validation-head-row,.validation-row{grid-template-columns:minmax(70px,1fr) minmax(80px,1fr) minmax(0,1.2fr);gap:5px;font-size:11px}.review-details-body{max-height:calc(100dvh - 240px)}}\n';
  document.head.append(style);
  function update(current,history){if(dialog){snapshot={current,history};render()}}
  return{open,close,update};
})();
`;
