import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {loadPreviewConfiguration,configuredMapping,routeUrl} from './preview-configuration.js';
import { scan } from './scan.js';
import { type PreviewApplication } from './example-preview-mappings.js';
import { validateProjectSourcePath, candidateApplicationRuntime } from './review-session.js';
import { composeWorkflowFile, type ReviewWorkflow } from './review-workflow.js';
import { verifiedSourceTransition } from './source-context.js';
import { classifyEligibility } from './eligibility.js';

export const ORIGINAL_PREVIEW_ORIGINS: Record<PreviewApplication,string> = {invoicing:'http://127.0.0.1:4200',procurement:'http://127.0.0.1:4201'};
const sha=(value:string)=>createHash('sha256').update(value).digest('hex');
export async function contextualPreview(root:string, query:URLSearchParams, workflow?:ReviewWorkflow) {
  const report=await scan(root);
  if(report.inputDigest!==query.get('inputDigest')||report.policyDigest!==query.get('policyDigest'))throw Error('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  const finding=report.findings.find(f=>f.id===query.get('findingId'));if(!finding)throw Error('FINDING_NOT_IN_CURRENT_REPORT');
  const historical=!!workflow&&workflow.state!=='Reviewing';
  if(historical)await verifiedSourceTransition(root,workflow!);
  else if(workflow&&(workflow.root!==root||workflow.inputDigest!==report.inputDigest||workflow.policyDigest!==report.policyDigest))throw Error('PREVIEW_SESSION_IDENTITY_MISMATCH');
  const configuration=await loadPreviewConfiguration(root);
  if(workflow&&configuration.digest!==(workflow.previewConfigDigest??sha('')))throw Error('PREVIEW_CONFIGURATION_CHANGED');
  const mapping=configuredMapping(finding,configuration),route=mapping.routes.find(r=>r.id===query.get('routeId'))||(!query.get('routeId')?mapping.routes[0]:undefined);
  const mode=query.get('mode')||'ltr';if(!['ltr','rtl'].includes(mode))throw Error('INVALID_PREVIEW_DIRECTION');
  if(mapping.routes.length&&!route)throw Error('UNAPPROVED_CONTEXT_ROUTE');
  const source=await readFile(await validateProjectSourcePath(root,finding.path),'utf8'),sourceHash=sha(source);
  const identity={projectRoot:root,inputDigest:report.inputDigest,policyDigest:report.policyDigest,findingId:finding.id,path:finding.path,line:finding.range.start.line,column:finding.range.start.column,sourceHash};
  const entry=historical?undefined:workflow?.entries.find(e=>e.finding.id===finding.id);
  const sessionId=historical?null:workflow?.session?.id||null;
  const eligibility=historical?classifyEligibility(finding,true,source):null;
  const review={inScope:historical||!workflow||!!entry,decision:entry?.decision||'Pending',applied:entry?.applied||false,hasAutomaticFix:historical?!!eligibility?.transformationId&&!eligibility.blockers.length:!!entry?.patch,validation:historical?'Not run':workflow?.validation?.state||'Not run',workflowState:workflow?.state||'No workflow',historical,patchInventory:historical?[]:workflow?.entries.filter(e=>e.patch&&e.applied).map(e=>({findingId:e.finding.id,path:e.finding.path,decision:e.decision}))||[]};
  const candidateState={prepared:!!sessionId,runtime:workflow?.session?.runtime?.status??'not-started'};
  if(!route)return {contextVersion:2,...identity,mapping,route:null,original:{available:false,state:'mapping-missing',reason:mapping.limitation},candidate:{available:false,state:'mapping-missing',reason:'Preview mapping unavailable; '+(sessionId?'candidate is prepared, but no route/target is configured.':'candidate has not been prepared.')},candidateState,reason:mapping.limitation,sessionId,review};
  const urlFor=(origin:string)=>routeUrl(route,mode as 'ltr'|'rtl',origin);
  async function runtime(origin:string,role:'original'|'candidate',expectedRoot:string,sessionId:string,hash:string){
    try{
      const response=await fetch(origin+'/__rtl_preview_identity',{signal:AbortSignal.timeout(1500)});const actual=await response.json() as {projectRoot:string;role:string;sessionId:string;application?:string;inputDigest?:string;policyDigest?:string;previewConfigDigest?:string;sourceHashes?:Record<string,string>};
      if(!response.ok||actual.projectRoot!==expectedRoot||actual.role!==role||actual.sessionId!==sessionId||actual.application!==route!.application||actual.previewConfigDigest!==configuration.digest||actual.inputDigest!==report.inputDigest||actual.policyDigest!==report.policyDigest||actual.sourceHashes?.[finding!.path]!==hash)return {available:false,origin,url:urlFor(origin),sourceHash:hash,projectRoot:expectedRoot,runtimeSessionId:sessionId,reason:'Runtime identity/source is stale or belongs to another application. Restart the scoped preview runtime.'};
      return {available:true,state:'runtime-ready',urls:{ltr:routeUrl(route!,'ltr',origin),rtl:routeUrl(route!,'rtl',origin)},origin,url:urlFor(origin),sourceHash:hash,projectRoot:expectedRoot,runtimeSessionId:sessionId,reason:null};
    }catch{return {available:false,origin,url:urlFor(origin),sourceHash:hash,projectRoot:expectedRoot,runtimeSessionId:sessionId,reason:'Runtime unavailable. Start the '+route!.application+' original/candidate preview runtime; no unrelated process will be stopped.'}}
  }
  const original=await runtime(configuration.applications[route.application]?.originalOrigin??ORIGINAL_PREVIEW_ORIGINS[route.application],'original',root,'original',sourceHash);
  let candidate=null,candidateReason=historical?'No current candidate. Historical candidate, decisions and validation remain bound to the completed review; they do not validate this current analysis.':'No isolated candidate session. Original contextual review does not require a codemod or an apply action.';
  if(workflow?.session&&entry&&workflow.state==='Reviewing'){
    // Verify the selected candidate file against its immutable baseline and actual patch membership.
    for(const [path,baseline] of Object.entries(workflow.baseline)){const expected=composeWorkflowFile(baseline,workflow.entries.filter(e=>e.patch?.path===path&&e.applied&&!['Rejected','Deferred','Flagged'].includes(e.decision)).map(e=>e.patch!));if(await readFile(await validateProjectSourcePath(workflow.session.candidateRoot,path),'utf8')!==expected)throw Error('STALE_CANDIDATE_SOURCE');}
    const before=workflow.baseline[finding.path];
    const expected=composeWorkflowFile(before,workflow.entries.filter(e=>e.patch?.path===finding.path&&e.applied&&!['Rejected','Deferred','Flagged'].includes(e.decision)).map(e=>e.patch!));
    const candidateSource=await readFile(await validateProjectSourcePath(workflow.session.candidateRoot,finding.path),'utf8');
    if(candidateSource!==expected)throw Error('STALE_CANDIDATE_SOURCE');
    const active=candidateApplicationRuntime(workflow.session,route.application);
    if(active?.status==='healthy')candidate=await runtime(active.origin,'candidate',workflow.session.candidateRoot,workflow.session.id,sha(candidateSource));
    candidateReason=active?.status==='healthy'?'':'Candidate application runtime is stopped. Use the explicit Open candidate preview action; selecting/highlighting does not start runtimes.';
  }
  return {contextVersion:2,...identity,mapping,route,dataAdapter:configuration.applications[route.application]?.dataAdapter??'atlas',original,candidate,candidateReason,candidateState,sessionId,review};
}
