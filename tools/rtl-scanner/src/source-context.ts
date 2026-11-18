import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import {previewConfigurationDigest,loadPreviewConfiguration,runtimeConfigName} from './preview-configuration.js';
import { scan } from './scan.js';
import type { Finding, Report } from './model.js';
import { manifestFromReport, reconcileScans } from './scan-history.js';
import { composeWorkflowFile, type ReviewWorkflow } from './review-workflow.js';
import { validateProjectSourcePath } from './review-session.js';
import { writePreviewRuntimeConfig } from './preview-runtime.js';

const sha=(text:string)=>createHash('sha256').update(text).digest('hex');

export type FindingSelection=Pick<Finding,'path'|'ruleId'> & {line:number;column:number};
/** Navigation correspondence is never approval correspondence. IDs may be reused at shifted ranges. */
export function reconcileSelectedFinding(previous:Finding|FindingSelection|undefined, report:Report, scope:readonly string[]=[]) {
  const findings=report.findings.filter(f=>!scope.length||scope.includes(f.path));
  const location=(f:Finding)=>[f.range.start.line,f.range.start.column];
  const anchor=previous&&('range' in previous?{line:previous.range.start.line,column:previous.range.start.column}:previous);
  const nearest=(values:Finding[])=>values.slice().sort((a,b)=>Math.abs(location(a)[0]-anchor!.line)-Math.abs(location(b)[0]-anchor!.line)||Math.abs(location(a)[1]-anchor!.column)-Math.abs(location(b)[1]-anchor!.column)||a.range.start.offset-b.range.start.offset)[0];
  let selected:Finding|undefined;
  if(previous){
    const sameRule=findings.filter(f=>f.path===previous.path&&f.ruleId===previous.ruleId);
    if('original' in previous){
      const current=manifestFromReport({...report,findings});
      const correspondence=reconcileScans({...current,findings:[previous]},current).find(c=>c.findingId===previous.id&&c.currentId&&c.status!=='Stale');
      const sameSource=sameRule.filter(f=>f.original===previous.original&&f.context===previous.context&&f.sourceMechanism===previous.sourceMechanism);
      selected=nearest(sameSource);
      // A reused ID alone cannot select a different expression. Structural/location checks above are required.
      if(selected&&correspondence?.currentId===selected.id)return {findingId:selected.id,matched:true,reason:'Selected finding reconciled by source, rule and location; fresh analysis has no inherited approval.'};
    }else selected=nearest(sameRule);
  }
  if(selected)return {findingId:selected.id,matched:true,reason:'Corresponding source/rule location selected for fresh analysis; no historical approval transferred.'};
  const actionable=findings.filter(f=>!['INFORMATIONAL','INTENTIONAL_LTR'].includes(f.category));
  selected=actionable.find(f=>f.path===previous?.path)||actionable[0]||findings[0];
  return {findingId:selected?.id??null,matched:false,reason:previous?'The selected finding no longer exists in the current report. '+(selected?'Selected a remaining finding for fresh review.':'No findings remain in the configured review scope.'):'Current report selected for fresh review.'};
}

/** A closed review is historical. Only its journaled source transition may authorize a new analysis. */
export async function verifiedSourceTransition(root:string, workflow:ReviewWorkflow) {
  if(workflow.root!==root||await realpath(root)!==root||!['Applied','Rolled Back'].includes(workflow.state)||!workflow.receipts?.length)throw Error('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  if(await previewConfigurationDigest(root)!==(workflow.previewConfigDigest??sha('')))throw Error('PREVIEW_CONFIGURATION_CHANGED');
  const applied=workflow.state==='Applied';
  for(const [path,before] of Object.entries(workflow.baseline)) {
    const after=composeWorkflowFile(before,workflow.entries.filter(e=>e.patch?.path===path&&e.applied&&e.decision==='Accepted').map(e=>e.patch!));
    if(after!==before) {
      const receipt=workflow.receipts.find(r=>r.path===path);
      // Partial Apply can leave planned files unwritten and without receipts. After rollback,
      // those files must still match baseline below; Applied always requires every receipt.
      if((applied||receipt)&&(!receipt||receipt.originalSha256!==sha(before)||receipt.appliedSha256!==sha(after)))throw Error('SOURCE_TRANSITION_RECEIPT_MISMATCH');
    }
    const target=await validateProjectSourcePath(root,path);
    if(target!==workflow.sourcePaths[path]||sha(await readFile(target,'utf8'))!==sha(applied?after:before))throw Error('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  }
  const report=await scan(root);
  const validatedScan=workflow.validation?.checks.find(c=>c.name==='scanner'&&c.state==='Passed');
  const expectedDigest=applied&&validatedScan?JSON.parse(validatedScan.detail).after:workflow.inputDigest;
  if(!report.complete||report.inputDigest!==expectedDigest||report.policyDigest!==workflow.policyDigest)throw Error('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  return report;
}

/** Refresh only generated, owned development wrappers after an authorized source transition.
 * Vite observes its config and restarts the same original runtime; no candidate or patch is created.
 */
export async function reconcileSourceRuntimes(root:string) {
  const report=await scan(root);
  const configuration=await loadPreviewConfiguration(root);
  for(const application of [...new Set(['invoicing','procurement',...Object.keys(configuration.applications)])]) {
    const path=join(root,'.rtl-preview',runtimeConfigName(application));
    const config=await readFile(path,'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error});
    if(!config.includes("name:'rtl-local-preview'"))continue;
    const source=configuration.applications[application]?.entry??(application==='invoicing'?'apps/invoicing/src/components/InvoiceTable.tsx':'apps/procurement/src/App.tsx');
    await writePreviewRuntimeConfig(root,{role:'original',sessionId:'original',sourceSha256:sha(await readFile(join(root,source),'utf8'))},{application});
    if(await readFile(path,'utf8')!==config) {
      const origin=configuration.applications[application]?.originalOrigin??(application==='invoicing'?'http://127.0.0.1:4200':'http://127.0.0.1:4201');
      const expected=sha(await readFile(join(root,source),'utf8'));
      for(let attempt=0;attempt<30;attempt++) {
        try {const actual=await fetch(origin+'/__rtl_preview_identity',{signal:AbortSignal.timeout(500)}).then(r=>r.json()) as {projectRoot:string;role:string;sourceSha256:string;inputDigest:string;application:string};if(actual.projectRoot===root&&actual.role==='original'&&actual.application===application&&actual.sourceSha256===expected&&actual.inputDigest===report.inputDigest)break;}catch{/* Explicit unavailable descriptors remain available if the runtime is stopped. */}
        await new Promise(resolve=>setTimeout(resolve,100));
      }
    }
  }
}
