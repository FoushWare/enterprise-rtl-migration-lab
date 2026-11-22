/** Verifies real source/route targets and notifies the workflow-owned preparation coordinator. */
import { createDashboardLeaseClient } from './dashboard-lease-client.js';
export const contextualPreviewClientSource = String.raw `
${createDashboardLeaseClient.toString()}
const dashboardLeases=createDashboardLeaseClient({origin:'http://127.0.0.1:4318',send:(url,init)=>fetch(url,init),target:window});
  const targetSelectionKey=(record,item)=>'rtl-context-target:'+JSON.stringify([record.projectRoot,d.inputDigest,d.policyDigest,record.workflowId,record.finding.id,record.finding.path,item.role,item.role==='candidate'?record.session?.id:record.historical?'current-source':'original',record.routeId]);
  function clearContextTargets(item){
    item.targetSignature=null;item.contextReport=null;item.lastVerifiedReport=null;item.verifiedMapping=null;item.fingerprint=null;
    item.state.dataset.targetCount='0';item.instanceSelect.replaceChildren(new Option('No target yet','0'));item.instanceSelect.disabled=true;
  }
  function reconcileContextTargets(item,record,report){
    const previous=item.instance,key=targetSelectionKey(record,item);let saved=null;try{saved=JSON.parse(sessionStorage.getItem(key))}catch{}
    const targets=report.targets;let selected=0,restoreFailed=false;
    if(saved?.restoreRequired){selected=-2;restoreFailed=true}
    else if((saved?.index===-1||saved?.value==='-1')&&targets.length)selected=-1;
    else if(saved?.targetKey){
      const matches=targets.filter(t=>t.key&&t.key===saved.targetKey);
      if(matches.length===1&&matches[0].keyGuaranteed&&!matches[0].ambiguous)selected=matches[0].index;
      else{try{sessionStorage.setItem(key,JSON.stringify({restoreRequired:true}))}catch{}selected=-2;restoreFailed=true}
    }else if(saved?.label){
      const labelMatches=targets.filter(t=>t.label===saved.label&&t.keyGuaranteed&&!t.ambiguous);
      if(labelMatches.length===1)selected=labelMatches[0].index;
      else{try{sessionStorage.setItem(key,JSON.stringify({restoreRequired:true}))}catch{}selected=-2;restoreFailed=true}
    }else{
      if(saved){try{sessionStorage.setItem(key,JSON.stringify({restoreRequired:true}))}catch{}selected=-2;restoreFailed=true}
      else selected=0;
    }
    const cleanLabel=l=>{const s=(l||'Element').trim().split(/\s+[^\s@]+@[^\s@]+\.[^\s@]+/)[0].trim();return s||'Element'};
    const options=targets.map(t=>({value:String(t.index),label:(t.index+1)+' · '+cleanLabel(t.label)}));
    if(restoreFailed)options.unshift({value:'',label:'Previous target could not be restored. Select a target.'});
    options.push(targets.length?{value:'-1',label:'All '+targets.length+' targets'}:{value:'0',label:'No target yet'});
    // Check the actual options too: an unavailable descriptor may have cleared the DOM since the last report.
    const signature=JSON.stringify([key,options]);
    if(item.targetSignature!==signature||JSON.stringify([...item.instanceSelect.options].map(o=>({value:o.value,label:o.label})))!==JSON.stringify(options))item.instanceSelect.replaceChildren(...options.map(o=>new Option(o.label,o.value)));
    item.targetSignature=signature;item.instance=selected;item.targetRestoreFailed=restoreFailed;item.instanceSelect.value=restoreFailed?'':String(selected);item.instanceSelect.disabled=!targets.length;
    if(targets.length&&previous!==selected)contextProbe(item,record,record.finding,'highlight');
  }
  function contextControls(current){
    if(current.contextControls)return;
    const record=current.record,make=(toolbar,expanded)=>{
      const group=el('div','','context-preview-controls'),route=document.createElement('select');route.setAttribute('aria-label',expanded?'Expanded contextual route':'Contextual route');route.onchange=()=>{record.routeId=route.value;current.items.forEach(item=>item.instance=0);contextRoutes(record,record.finding,current)};
      const highlight=el('button','Highlight targets');highlight.onclick=()=>current.items.forEach(item=>contextProbe(item,record,record.finding,'highlight'));
      const reveal=el('button','Reveal navigation');reveal.onclick=()=>current.items.forEach(item=>contextProbe(item,record,record.finding,'reveal-navigation'));
      const start=el('button','Open candidate application');start.disabled=!record.session||!!record.historical;start.onclick=()=>{if(record.session&&!record.historical&&record.workflowId)window.dispatchEvent(new CustomEvent('rtl-context-runtime-request',{detail:{workflowId:record.workflowId,application:record.contextInfo?.route?.application}}))};
      const retry=el('button','Retry context','context-retry');retry.onclick=()=>contextRoutes(record,record.finding,current);
      const reset=el('button','Reset preview data');reset.title='Reset only the dedicated preview dataset on both origins; ordinary application storage is preserved.';reset.onclick=()=>{if(!record.defaultSeed)return;record.seedSnapshot=record.defaultSeed;current.items.forEach(item=>{item.ready=null;item.state.dataset.state='loading';item.state.dataset.contextStatus='loading-route';item.state.textContent='Resetting dedicated preview data…';contextProbe(item,record,record.finding,'reset-data')})};
      group.append(route,highlight,reveal,reset,start,retry);if(expanded)toolbar.insertBefore(group,toolbar.querySelector('.preview-workspace-close'));else toolbar.append(group);return {group,route,reveal,start,reset};
    };
    current.contextControls=[make(current.component.querySelector('.component-toolbar'),false),make(current.workspace,true)];
    const summary=el('span','Locating contextual target…','preview-context-summary');current.workspace.insertBefore(summary,current.workspace.querySelector('.preview-workspace-close'));current.contextSummary=summary;
    for(const item of current.items){const instance=document.createElement('select');instance.setAttribute('aria-label',item.role==='original'?'Original target instance':'Candidate target instance');instance.className='context-instance';instance.onchange=()=>{if(instance.value==='')return;item.instance=Number(instance.value);const target=item.contextReport?.targets.find(t=>t.index===item.instance);item.targetRestoreFailed=false;if(item.instance===-1){sessionStorage.setItem(targetSelectionKey(record,item),JSON.stringify({index:-1,label:'All targets'}))}else if(target&&target.keyGuaranteed&&target.key&&!target.ambiguous){sessionStorage.setItem(targetSelectionKey(record,item),JSON.stringify({index:item.instance,targetKey:target.key,label:target.label}))}else{sessionStorage.removeItem(targetSelectionKey(record,item))};contextProbe(item,record,record.finding,'highlight')};item.instance=0;item.instanceSelect=instance;clearContextTargets(item);item.panel.querySelector('h3').append(instance)}
  }
  const candidateEligible=record=>!!record.contextInfo?.review?.hasAutomaticFix&&record.contextInfo.review.inScope!==false&&!record.historical&&!['Rejected','Deferred','Flagged'].includes(record.contextInfo.review.decision);
  function activateVerifiedCandidate(current){
    const record=current.record,item=current.items[1],descriptor=record.contextInfo?.candidate;
    if(!candidateEligible(record)||!record.entryApplied||!descriptor?.available||!(capability(record.finding)?.verified||capability(record.finding)?.bindingVerified))return;
    item.context=descriptor;item.application=record.contextInfo.route.application;load(item,descriptor.url,record,record.finding,descriptor.sourceHash);resize(item,record);
  }
  async function contextRoutes(record,f,current){
    if(!current||!live(record,current.component))return;contextControls(current);
    current.component.dataset.mappingMissing='false';current.component.querySelector('.mapping-unavailable')?.remove();const token=(record.routeToken||0)+1;record.routeToken=token;record.contextResolving=true;for(const item of current.items){item.state.dataset.state='loading';item.state.dataset.contextStatus='loading-route';item.state.textContent='Resolving current route and contextual target…'}
    try{
      const query=new URLSearchParams({inputDigest:d.inputDigest,policyDigest:d.policyDigest,findingId:f.id,mode:record.mode,...(record.workflowId?{workflowId:record.workflowId}:{}),...(record.routeId?{routeId:record.routeId}:{})});
      let info=await request('/contextual-preview?'+query);
      // Original initialization never enters the candidate mutation/runtime path.
      if(!live(record,current.component)||record.routeToken!==token)return;
      if(info.route&&!info.original?.available){
        // Present this page's own lease back so a retry reuses it; the CLI's lease is never shown to the page.
        const presented=new URLSearchParams(query);const held=dashboardLeases.tokenFor(info.route.application);if(held)presented.set('dashboardLease',held);
        try{info=await request('/contextual-preview/original?'+presented,{method:'POST'});dashboardLeases.remember(info.originalLease);}catch(error){info.original={...info.original,reason:(info.original?.reason||'Original runtime unavailable.')+' Automatic original initialization failed: '+error.message+'. Retry context after runtime recovery.'};}
      }if(!live(record,current.component)||record.routeToken!==token)return;
      if(info.projectRoot!==record.projectRoot||info.findingId!==f.id||info.path!==f.path||info.inputDigest!==d.inputDigest||info.policyDigest!==d.policyDigest||info.sessionId!==(record.session?.id||null))throw Error('PREVIEW_SESSION_IDENTITY_MISMATCH');
      record.contextResolving=false;record.contextInfo=info;record.routeId=info.route?.id;record.runtime=info.candidate?.available?{runtime:{origin:info.candidate.origin,status:'healthy'}}:null;if(info.original?.available){const u=new URL(info.original.origin);if(u.protocol==='http:'&&u.hostname==='127.0.0.1')originalOrigins.add(u.origin)}syncRoute(current);
      if(!record.contextDefaults){record.contextDefaults=true;if(info.mapping.preferredViewport!==undefined){record.viewport=info.mapping.preferredViewport;const viewport=[...current.component.querySelector('.component-toolbar').querySelectorAll('button')].find(b=>['Desktop','Tablet','Mobile'].includes(b.textContent));if(viewport)viewport.textContent=['Desktop','Tablet','Mobile'][record.viewport]}if(info.mapping.preferredMode&&info.mapping.preferredMode!==record.mode){record.mode=info.mapping.preferredMode;syncControls(current);return contextRoutes(record,f,current)}}
      syncControls(current);
      for(const controls of current.contextControls){controls.route.replaceChildren(...info.mapping.routes.map(route=>new Option(route.label,route.id)));controls.route.value=record.routeId||'';controls.route.disabled=!info.mapping.routes.length;controls.reset.hidden=info.dataAdapter==='none'||!info.route;controls.reveal.hidden=!info.mapping.css?.media&&!info.mapping.routes.some(r=>r.prepare==='sidebar');controls.start.hidden=!info.review?.hasAutomaticFix||!!info.candidate?.available;controls.start.disabled=!info.route||!record.session||info.review?.workflowState!=='Reviewing'}
      const summary=info.mapping.label+' · '+info.path+':'+info.line;current.contextSummary.textContent=summary;
      const helper=current.component.querySelector('.component-helper'),hasPatch=!!info.review?.hasAutomaticFix,afterPane=current.component.querySelector('.component-after'),arrow=current.component.querySelector('.component-arrow');current.component.dataset.manualOnly=String(!hasPatch);if(afterPane)afterPane.style.display='';if(arrow)arrow.style.display='';const compare=current.component.querySelector('.component-compare');if(compare)compare.style.gridTemplateColumns='minmax(0,1fr) auto minmax(0,1fr)';if(helper)helper.textContent=(info.mapping.configured?'Configured context · ':'Example-specific context · ')+summary+' · '+(info.mapping.limitation||'Live target checks are separate from validation and approval.')+(info.review?.inScope===false?' · Outside the selected review scope; original contextual review remains available.':hasPatch?'':' · Source requiring review. '+(info.review?.reason||f.rationale||'No supported candidate patch.')); 
      for(const item of current.items){const descriptor=info[item.role==='original'?'original':'candidate'];item.context=descriptor;item.application=info.route?.application;
        if(item.role==='candidate'&&descriptor?.available&&candidateEligible(record)&&record.entryApplied){activateVerifiedCandidate(current);if(!item.frame)item.state.textContent='Waiting for verified Before before displaying this isolated candidate…';}
        else if(descriptor?.available&&item.role==='original'){load(item,descriptor.url,record,f,descriptor.sourceHash);resize(item,record)}
        else{clearTimeout(item.timeout);item.box.replaceChildren();item.frame=null;item.ready=null;clearContextTargets(item);item.state.dataset.state='unavailable';item.state.dataset.contextStatus=!info.route?'mapping-missing':'runtime-unavailable';item.state.textContent=item.role==='original'?(descriptor?.reason||info.reason||'Unresolved contextual mapping.'):!info.review?.hasAutomaticFix?'Manual review required · '+[info.review?.reason,f.rationale,f.treatment].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' '):(!record.session?'No candidate prepared · validation: Not run':descriptor?.reason||info.candidateReason||'No isolated candidate is available.');}
      }
      if(!info.route){
        current.component.dataset.mappingMissing='true';const unavailable=el('section','','mapping-unavailable');unavailable.setAttribute('role','status');unavailable.append(el('h3','Live preview unavailable'),el('p',info.review?.hasAutomaticFix?'This finding has no configured page/element mapping. Review the supported candidate in code; its visual effect has not been verified.':'Source requiring review. No configured page/element mapping or supported candidate patch is available. '+(f.rationale||'')));unavailable.append(el('p','Approval is unavailable without a verified page/element binding and required direction evidence. Review the code, choose Defer or Needs review, or configure an accurate preview binding.'));current.component.append(unavailable);
      }
      updateCandidateAction(current);syncRoute(current);
      current.component.querySelectorAll('.route-actions button').forEach((button,index)=>{button.disabled=!info.candidate?.available;button.onclick=()=>{const url=new URL(info.candidate.urls?.[index?'rtl':'ltr']||info.candidate.url);if(!info.candidate.urls)url.searchParams.set('lang',index?'ar':'en');if(originAllowed(url.href,'candidate'))window.open(url.href,'_blank','noopener,noreferrer')}});
    }catch(error){if(live(record,current.component)&&record.routeToken===token){record.contextResolving=false;for(const item of current.items){clearTimeout(item.timeout);item.box.replaceChildren();item.frame=null;item.ready=null;clearContextTargets(item);item.state.dataset.state='error';item.state.dataset.contextStatus='unavailable';item.state.textContent='Context unavailable: '+error.message+'. Retry connection or restart the scoped application runtime.'}current.contextSummary.textContent='Context unavailable · '+error.message;updateCandidateAction(current)}}
  }
  function updateCandidateAction(current){
    const button=document.querySelector('.decision-card [data-candidate-action]');if(selected!==current.record.key)return;
    if(current.record.workflowId){window.dispatchEvent(new CustomEvent('rtl-context-preview-updated',{detail:{workflowId:current.record.workflowId,findingId:current.record.finding.id}}));return;}
    if(!button)return;const verified=capability(current.record.finding)?.verified;button.textContent=verified?'Apply & Preview':'Prepare candidate';
  }

  function contextProbe(item,record,f,command){
    if(!item.frame||!item.nonce||!item.context?.available||!record.contextInfo?.route)return;
    item.frame.contentWindow?.postMessage({type:'rtl-context-probe',version:2,nonce:item.nonce,role:item.role,application:item.application,sessionId:record.session?.id||'before-only',runtimeSessionId:item.context.runtimeSessionId,projectRoot:item.context.projectRoot,findingId:f.id,sourcePath:f.path,sourceSha256:item.expectedHash,routeId:record.routeId,mode:record.mode,instance:item.instance||0,seedData:command==='reset-data'?record.defaultSeed:item.role==='candidate'?record.seedSnapshot:undefined,...(command?{command}:{})},new URL(item.url).origin);
  }
  window.addEventListener('message',event=>{
    if(!view?.record.contextual||selected!==view.record.key||view.record.contextResolving)return;const record=view.record,p=event.data;
    if(!p||!['rtl-context-status','rtl-context-navigation','rtl-context-direction-changed'].includes(p.type)||p.version!==2)return;
    if(p.type==='rtl-context-direction-changed'){
      const item=view.items.find(item=>item.frame&&event.source===item.frame.contentWindow&&event.origin===new URL(item.url).origin&&p.nonce===item.nonce&&p.role===item.role&&p.application===item.application&&p.projectRoot===item.context?.projectRoot&&p.runtimeSessionId===item.context?.runtimeSessionId&&p.sessionId===(record.session?.id||'before-only')&&p.findingId===record.finding.id&&p.sourcePath===record.finding.path&&p.sourceSha256===item.expectedHash&&p.routeId===record.routeId);
      if(!item||!Number.isSafeInteger(p.directionRevision)||p.directionRevision<=(item.directionRevision??-1))return; item.directionRevision=p.directionRevision; item.ready=null; item.contextReport=null; item.verifiedMapping=null; item.lastVerifiedReport=null; item.state.dataset.state='loading'; item.state.dataset.contextStatus='direction-changed'; item.state.textContent='Live application direction changed; refreshing evidence…'; contextProbe(item,record,record.finding,'highlight'); return;
    }
    if(p.type==='rtl-context-navigation'){
      const item=view.items.find(item=>item.frame&&event.source===item.frame.contentWindow&&event.origin===new URL(item.url).origin&&p.nonce===item.nonce&&p.role===item.role&&p.application===item.application&&p.projectRoot===item.context?.projectRoot&&p.runtimeSessionId===item.context?.runtimeSessionId&&p.sessionId===(record.session?.id||'before-only')&&p.findingId===record.finding.id&&p.sourcePath===record.finding.path&&p.sourceSha256===item.expectedHash&&p.routeId===record.routeId);
      if(!item)return;const route=record.contextInfo.mapping.routes.find(route=>route.application===p.nextApplication);
      if(route){record.routeId=route.id;contextRoutes(record,record.finding,view)}else view.contextSummary.textContent='No verified consuming route in '+p.nextApplication+' for this finding. Choose a finding in that application.';return;
    }
    for(const item of view.items){
      if(!item.frame||event.source!==item.frame.contentWindow||event.origin!==new URL(item.url).origin||p.nonce!==item.nonce||p.role!==item.role||p.application!==item.application||p.projectRoot!==item.context?.projectRoot||p.runtimeSessionId!==item.context?.runtimeSessionId||p.sessionId!==(record.session?.id||'before-only')||p.findingId!==record.finding.id||p.sourcePath!==record.finding.path||p.sourceSha256!==item.expectedHash||p.routeId!==record.routeId||!['ltr','rtl'].includes(p.dir)||typeof p.route!=='string'||p.route.length>200||!/^\/[a-zA-Z0-9/_-]*$/.test(p.route)||!Array.isArray(p.targets)||p.targets.length>500||p.targets.some(t=>!t||!Number.isInteger(t.index)||typeof t.label!=='string'||t.label.length>100||typeof t.rendered!=='boolean'||!t.rect||Object.values(t.rect).some(n=>typeof n!=='number'||!Number.isFinite(n))))continue;
      if(!Number.isSafeInteger(p.directionRevision)||p.directionRevision<(item.directionRevision??0)||p.targets.some(t=>!['ltr','rtl'].includes(t.effectiveDirection)))continue; item.directionRevision=p.directionRevision;
      item.currentRoute=p.route;syncRoute(view);
      if(p.dir!==record.mode){item.contextReport=p;item.ready=null;clearTimeout(item.timeout);item.state.dataset.state='navigated';item.state.dataset.contextStatus='navigated';item.state.textContent='Live application · direction changed inside the app to '+p.dir.toUpperCase()+'. Re-select '+record.mode.toUpperCase()+' in the toolbar to restore the comparison direction.';continue}
      if(item.role==='original'&&typeof p.seedData==='string'&&p.seedData.length<100000){record.seedSnapshot=p.seedData;record.defaultSeed=p.defaultSeedData}
      item.fingerprint=p.dataFingerprint;
      reconcileContextTargets(item,record,p);
      const rendered=p.targets.filter(t=>t.rendered).length,offscreen=p.targets.filter(t=>t.rendered&&!t.inViewport).length;
      const targetStatus=p.route!==record.contextInfo.route.path||p.targetStatus==='navigated'?'navigated':p.targetStatus==='document'&&rendered?'document':p.targetStatus==='verified'&&rendered&&p.routeReady&&(!record.contextInfo.mapping.configured||!record.contextInfo.mapping.sourceSelector||p.sourceStatus==='source-rule-matched')?'verified':p.targetStatus==='preparing'?'preparing':['source-not-loaded','target-mismatch','missing-target','route-not-ready'].includes(p.targetStatus)?p.targetStatus:p.targets.length?'hidden':'unresolved';
      item.state.dataset.contextStatus=item.targetRestoreFailed?'target-selection-required':targetStatus;item.state.dataset.routeReady=String(!!p.routeReady);item.state.dataset.targetCount=String(p.targets.length);item.state.dataset.state=item.targetRestoreFailed?'unresolved':targetStatus==='navigated'?'navigated':['verified','document'].includes(targetStatus)?'ready':targetStatus==='preparing'?'loading':'unresolved';
      const contextLabel=item.targetRestoreFailed?'Previous target could not be restored. Select a target.':targetStatus==='verified'?'Verified targets: '+p.targets.length+(offscreen?' · '+offscreen+' outside viewport':''):targetStatus==='document'?'Page/document-wide context':targetStatus==='navigated'?'Live application · navigated away from target':targetStatus==='route-not-ready'?'Application readiness target not observed on configured route':targetStatus==='source-not-loaded'?'Source stylesheet/rule not observed on this route · mapping unverified':targetStatus==='target-mismatch'?'Configured target does not match the source rule · mapping unverified':targetStatus==='missing-target'?'Source rule loaded; configured target is missing on this route':targetStatus==='hidden'?'Selector located · hidden at this viewport':targetStatus==='preparing'?'Preparing existing UI state…':'Route ready; target unresolved. Retry Highlight targets or restore the required UI state.';
      const css=item.targetRestoreFailed?null:p.targets.find(t=>t.index===item.instance)?.css;const evidence=contextLabel+' · '+p.route+' · page '+p.dir.toUpperCase()+' · target '+(p.targets.find(t=>t.index===item.instance)?.effectiveDirection||'unknown').toUpperCase()+(css?' · CSS '+css.sourceProperty+(css.resolvedProperty!==css.sourceProperty?' → '+css.resolvedProperty:'')+': '+css.contribution+' · computed '+css.computedValue:'')+(item.role==='candidate'?' · '+candidateStatus(record)+' · '+(record.contextInfo.review.applied?'selected preview patch present':'selected finding unchanged')+' · '+record.contextInfo.review.patchInventory.length+' actual candidate patches':'');if(item.diagnostic)setText(item.diagnostic,(item.role==='original'?'Before: ':'After: ')+evidence);setText(item.state,['verified','document'].includes(targetStatus)?contextLabel:evidence);
      if(['verified','document','navigated','hidden'].includes(targetStatus)&&!item.targetRestoreFailed){item.ready=p;clearTimeout(item.timeout)}else if(item.targetRestoreFailed){item.ready=null;item.lastVerifiedReport=null;item.verifiedMapping=null;}
      if(['verified','document'].includes(targetStatus)&&!item.targetRestoreFailed){item.lastVerifiedReport=p;item.verifiedMapping={sourceHash:item.expectedHash,routeId:record.routeId};}
      item.contextReport=p;if(item.role==='original')activateVerifiedCandidate(view);updateCandidateAction(view);syncRoute(view);
    }
    const [before,after]=view.items;if(before.fingerprint&&after.fingerprint&&before.fingerprint!==after.fingerprint){setText(view.contextSummary,'Preview datasets differ after interaction · Reset preview data to compare equivalent data; this is not a patch effect.')}else if(record.contextInfo){setText(view.contextSummary,record.contextInfo.mapping.label+' · '+(record.contextInfo.dataAdapter==='none'?'Application data · dataset equivalence unverified':before.fingerprint&&after.fingerprint?'Equivalent preview data':'Dedicated preview data'))}
  });
`;
