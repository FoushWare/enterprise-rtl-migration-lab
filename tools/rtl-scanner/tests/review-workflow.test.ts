import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hash } from '../src/model.js';
import { scan } from '../src/scan.js';
import { composeWorkflowFile, ReviewWorkflowStore } from '../src/review-workflow.js';
import { ApplyAuditStore, ControlledApplyService } from '../src/controlled-apply.js';
import type { PatchRequest } from '../src/review-session.js';
const file = 'apps/invoicing/src/components/InvoiceTable.tsx';
const patch = (startOffset: number, endOffset: number, before: string, replacement: string): PatchRequest => ({findingId:'test',path:file,startOffset,endOffset,expectedSha256:hash(before),replacement});
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(),'rtl-workflow-test-')));
  await mkdir(join(root,'apps/invoicing/src/components'),{recursive:true}); await mkdir(join(root,'libs'));
  await writeFile(join(root,'apps/invoicing/project.json'),JSON.stringify({sourceRoot:'apps/invoicing/src'}));
  await writeFile(join(root,'apps/invoicing/index.html'),'<html dir="ltr"><body></body></html>');
  await writeFile(join(root,file),'export const View=({a}:{a:{id:string}})=><><span>{a.id}</span><span>{a.id}</span><span>{a.account.id}</span></>;');
  for(const name of ['package.json','nx.json','tsconfig.json'])await writeFile(join(root,name),'{}');
  await writeFile(join(root,'rtl-scanner.config.json'),JSON.stringify({schemaVersion:1,generatedStyleOwner:'unknown',ownership:{},approvals:[],exceptions:[],issueBindings:[],dynamicExceptions:[],roles:[]}));
  const audit = new ApplyAuditStore(join(root,'state/audit.json'));
  const apply = new ControlledApplyService(root,audit,join(root,'state/backups'));
  const store = new ReviewWorkflowStore(root,join(root,'state/workflows.json'),apply);
  await store.load(); return {root,store,apply,audit};
}
describe('multi-finding workflow safety',()=>{
  it('begins a review in a single-application tree that has neither an apps nor a libs directory',async()=>{
    const root=await realpath(await mkdtemp(join(tmpdir(),'rtl-workflow-single-')));
    try{
      await mkdir(join(root,'src'),{recursive:true});await writeFile(join(root,'src/Badge.tsx'),'export const Badge=({a}:{a:{id:string}})=><span>{a.id}</span>;');
      await writeFile(join(root,'package.json'),'{}');await writeFile(join(root,'rtl-scanner.config.json'),JSON.stringify({schemaVersion:1,generatedStyleOwner:'unknown',ownership:{},approvals:[],exceptions:[],issueBindings:[],dynamicExceptions:[],roles:[]}));
      const store=new ReviewWorkflowStore(root,join(root,'state/workflows.json'),new ControlledApplyService(root,new ApplyAuditStore(join(root,'state/audit.json')),join(root,'state/backups')));await store.load();
      const report=await scan(root);const w=await store.begin({...report,mode:'one-by-one'});
      expect(w.state).toBe('Reviewing');expect(w.entries.some(e=>e.finding.path==='src/Badge.tsx')).toBe(true);
    }finally{await rm(root,{recursive:true,force:true})}
  });
  it('explicit batch preparation excludes unmapped entries and rejects forged batch selections without source writes',async()=>{
    const {root,store}=await fixture();try{const report=await scan(root),w=await store.begin({...report,mode:'apply-first'}),before=await readFile(join(root,file),'utf8'),e=w.entries.find(e=>e.patch)!;
      await store.change(w.id,e.finding.id,{action:'notes',notes:'Keep my draft-backed saved note'});
      await expect(store.approveBatch(w.id,[e.finding.id])).rejects.toThrow('PREPARE_BATCH_BEFORE_APPROVAL');
      await store.prepareBatch(w.id);expect(w.batchPreparation).toBe('ready');expect(w.batchPreparedAt).toBeTruthy();expect(w.entries.filter(e=>e.batch?.state==='ready')).toHaveLength(0);expect(w.entries.every(e=>!e.applied)).toBe(true);expect(e.notes).toBe('Keep my draft-backed saved note');
      await expect(store.approveBatch(w.id,[e.finding.id])).rejects.toThrow('BATCH_SELECTION_NOT_ELIGIBLE');await expect(store.approveBatch(w.id,[])).rejects.toThrow('INVALID_BATCH_SELECTION');
      expect(w.entries.every(e=>e.decision==='Pending')).toBe(true);expect(await readFile(join(root,file),'utf8')).toBe(before);
    }finally{await rm(root,{recursive:true,force:true})}
  });
  for(const mode of ['one-by-one','apply-first'] as const)it(mode+' resumes a verified rollback as idempotent analysis only, retaining immutable history',async()=>{
    const {root,store,apply}=await fixture();try{
      const second='apps/invoicing/src/components/Other.tsx';await writeFile(join(root,second),'export const Other=({a}:{a:{id:string}})=><span>{a.id}</span>;');
      const report=await scan(root),old=await store.begin({...report,mode:'one-by-one',scope:mode==='apply-first'?[file,second]:[]});
      await expect(store.resumeAfterRollback(old.id)).rejects.toThrow('SUCCESSFUL_ROLLBACK_REQUIRED');
      old.mode=mode;const e=old.entries.find(e=>e.patch)!;e.applied=true;e.decision='Accepted';e.history.push({decision:'Accepted',notes:'historical',at:'2026-11-18'});
      // The second accepted file was planned but never written by a partial Apply; it has no receipt.
      const unwritten=old.entries.find(e=>e.finding.path===second)!;unwritten.applied=true;unwritten.decision='Accepted';
      const after=composeWorkflowFile(old.baseline[file],[e.patch!]);
      old.receipts=await apply.applyAcceptedFiles(old.id,[{path:file,before:old.baseline[file],after}],'APPLY_CONFIRMED');old.state='Applied';
      old.validation={state:'Passed',signature:'historical',checks:[],at:'2026-11-18',hashes:{}};
      await store.rollback(old.id,'ROLLBACK_CONFIRMED');const snapshot=JSON.stringify(old);
      const fresh=await store.resumeAfterRollback(old.id);expect(fresh.id).not.toBe(old.id);expect(fresh.resumedFrom).toBe(old.id);expect(fresh.mode).toBe(mode);expect(fresh.scope).toEqual(old.scope);expect(fresh.inputDigest).toBe(report.inputDigest);expect(fresh.session).toBeUndefined();expect(fresh.validation).toBeUndefined();expect(fresh.receipts).toBeUndefined();expect(fresh.entries.every(e=>e.decision==='Pending'&&!e.applied&&!e.history.length)).toBe(true);expect(fresh.entries.find(item=>item.finding.id===e.finding.id)?.patch).toBeTruthy();expect(JSON.stringify(old)).toBe(snapshot);
      expect((await store.resumeAfterRollback(old.id)).id).toBe(fresh.id);
      const restored=new ReviewWorkflowStore(root,store.path,new ControlledApplyService(root));await restored.load();expect((await restored.resumeAfterRollback(old.id)).id).toBe(fresh.id);expect(restored.get(fresh.id).session).toBeUndefined();expect(JSON.stringify(restored.get(old.id))).toBe(snapshot);
      await writeFile(join(root,file),old.baseline[file]+'// external edit');await expect(restored.resumeAfterRollback(old.id)).rejects.toThrow('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
    }finally{await rm(root,{recursive:true,force:true})}
  });
  it('saves notes without candidate preparation or changing validation and decisions',async()=>{
    const {root,store}=await fixture();try{
      const report=await scan(root),w=await store.begin({...report,mode:'one-by-one'}),e=w.entries.find(e=>e.patch)!;
      await store.change(w.id,e.finding.id,{action:'notes',notes:'Check reading edge'});
      expect(w.session).toBeUndefined();expect(e.applied).toBe(false);expect(e.decision).toBe('Pending');
      const validation={state:'Passed' as const,signature:'retained',checks:[],at:'2026-11-18',hashes:{}};w.validation=validation;
      await store.change(w.id,e.finding.id,{action:'notes',notes:'Updated note'});expect(w.validation).toBe(validation);
      const restored=new ReviewWorkflowStore(root,store.path,new ControlledApplyService(root));await restored.load();
      expect(restored.get(w.id).entries.find(x=>x.finding.id===e.finding.id)?.notes).toBe('Updated note');expect(restored.get(w.id).session).toBeUndefined();
    }finally{await rm(root,{recursive:true,force:true})}
  });
  it('uses original coordinates for length-changing edits and refuses overlaps or stale slices',()=>{
    const a=patch(0,2,'ab','long'),b=patch(4,6,'ef','x');
    expect(composeWorkflowFile('abcdef',[a,b])).toBe('longcdx');
    expect(composeWorkflowFile('abcdef',[b])).toBe('abcdx');
    expect(()=>composeWorkflowFile('abcdef',[a,patch(1,3,'bc','q')])).toThrow('OVERLAPPING');
    expect(()=>composeWorkflowFile('abcdef',[{...b,expectedSha256:hash('wrong')}])).toThrow('STALE_PATCH');
  });
  it('analyzes without a candidate, rejects one same-file patch without removing acceptance, restores decisions, and blocks stale source',async()=>{
    const {root,store}=await fixture();let candidateRoot:string|undefined;
    try{
      const report=await scan(root); const w=await store.begin({...report,mode:'one-by-one'}); expect(w.session).toBeUndefined();
      const supported=w.entries.filter(e=>e.patch);expect(supported).toHaveLength(2);expect(w.entries.some(e=>!e.patch)).toBe(true);
      await store.change(w.id,supported[0].finding.id,{action:'apply'}); candidateRoot=w.session!.candidateRoot;
      await store.change(w.id,supported[0].finding.id,{action:'Accepted',notes:'Reviewed'});
      await store.change(w.id,supported[1].finding.id,{action:'apply'});
      await store.change(w.id,supported[1].finding.id,{action:'Rejected'});
      expect((await readFile(join(candidateRoot,file),'utf8')).match(/<bdi/g)).toHaveLength(1);
      const restored=new ReviewWorkflowStore(root,store.path,new ControlledApplyService(root));await restored.load();
      expect(restored.get(w.id).entries.filter(e=>e.decision==='Accepted')).toHaveLength(1);
      await writeFile(join(root,file),(await readFile(join(root,file),'utf8'))+'// later user edit');
      await expect(store.change(w.id,supported[0].finding.id,{action:'Rejected'})).rejects.toThrow('STALE_ORIGINAL_SOURCE');
    }finally{if(candidateRoot)await rm(candidateRoot,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
  });
  it('journals multi-file writes, resumes idempotently, and refuses rollback over later edits',async()=>{
    const {root,apply,audit}=await fixture();try{
      const before=await readFile(join(root,file),'utf8');const second='apps/invoicing/src/components/Other.tsx';await writeFile(join(root,second),'export const value=1;');const files=[{path:file,before,after:before+'// accepted'},{path:second,before:'export const value=1;',after:'export const value=2;'}];
      const receipts=await apply.applyAcceptedFiles('op',files,'APPLY_CONFIRMED');
      expect(await apply.applyAcceptedFiles('op',files,'APPLY_CONFIRMED')).toEqual(receipts);
      expect((await audit.list()).filter(e=>e.type==='APPLIED')).toHaveLength(2);
      await writeFile(join(root,file),before+'// user edit');
      await expect(apply.rollbackAcceptedFiles(receipts)).rejects.toThrow('ROLLBACK_CONFLICT');
      expect(await readFile(join(root,file),'utf8')).toBe(before+'// user edit');expect(await readFile(join(root,second),'utf8')).toBe('export const value=2;');
      // Authorized rollback rejected by a source integrity conflict: one structured ROLLBACK_FAILED record, hashes only.
      const failures=(await audit.list()).filter(e=>e.type==='ROLLBACK_FAILED');
      expect(failures).toHaveLength(1);
      expect(failures[0]).toMatchObject({auditId:receipts[0].auditId,type:'ROLLBACK_FAILED',path:file,reason:'CURRENT_SOURCE_CHANGED',sourceSha256:receipts[0].originalSha256,backupPath:receipts[0].backupPath});
      expect(failures[0].resultingSha256).toBe(hash(before+'// user edit'));
      expect(JSON.stringify(await audit.list())).not.toContain('user edit');
      expect(JSON.stringify(await audit.list())).not.toContain('export const View');
      // A refused rollback is repeatable: a second attempt records its own failure and writes nothing.
      await expect(apply.rollbackAcceptedFiles(receipts)).rejects.toThrow('ROLLBACK_CONFLICT');
      expect((await audit.list()).filter(e=>e.type==='ROLLBACK_FAILED')).toHaveLength(2);
      expect(await readFile(join(root,file),'utf8')).toBe(before+'// user edit');
      await writeFile(join(root,file),files[0].after);await apply.rollbackAcceptedFiles(receipts);
      expect(await readFile(join(root,file),'utf8')).toBe(before);expect(await readFile(join(root,second),'utf8')).toBe('export const value=1;');
      expect((await audit.list()).filter(e=>e.type==='ROLLED_BACK')).toHaveLength(2);
      // An untrusted receipt is refused without any audit record, authorized or not.
      const beforeUntrusted=(await audit.list()).length;
      await expect(apply.rollbackAcceptedFiles([{...receipts[0],backupPath:'/untrusted'}])).rejects.toThrow('ROLLBACK_RECEIPT_UNTRUSTED');
      expect((await audit.list()).length).toBe(beforeUntrusted);
    }finally{await rm(root,{recursive:true,force:true})}
  });
});

async function previewFixture(){const result=await fixture();await writeFile(join(result.root,'apps/invoicing/vite.config.ts'),'export default {};');await writeFile(join(result.root,'rtl-preview.config.json'),JSON.stringify({schemaVersion:1,applications:{unit:{viteConfig:'apps/invoicing/vite.config.ts',entry:file,originalOrigin:'http://127.0.0.1:4215',readySelector:'span',dataAdapter:'none',routes:[{id:'unit',path:'/unit',ltr:'/unit?direction=ltr',rtl:'/unit?direction=rtl'}]}},mappings:[{source:file,targetSelector:'span',routes:[{application:'unit',route:'unit'}]}]}));return result;}
it('prepares the mapped isolated preview idempotently without approval, source writes or discarding current validation on reuse',async()=>{
 const {root,store}=await previewFixture();let candidate:string|undefined;
 try{
  const {configuredMapping,loadPreviewConfiguration}=await import('../src/preview-configuration.js');const {vi}=await import('vitest');
  const report=await scan(root),w=await store.begin({...report,mode:'one-by-one'}),entry=w.entries.find(e=>e.patch)!,route=configuredMapping(entry.finding,await loadPreviewConfiguration(root)).routes[0];expect(route).toBeTruthy();
  const runtime=vi.spyOn(store,'runtime').mockImplementation(async()=>{w.session!.runtime={status:'healthy',port:4202,origin:'http://127.0.0.1:4202'};return w;}),before=await readFile(join(root,file),'utf8');
  const input={findingId:entry.finding.id,application:route.application,routeId:route.id,inputDigest:report.inputDigest,policyDigest:report.policyDigest};
  await store.preparePreview(w.id,input);candidate=w.session!.candidateRoot;expect(entry.decision).toBe('Pending');expect(entry.history).toEqual([]);expect(await readFile(join(root,file),'utf8')).toBe(before);const composed=await readFile(join(candidate,file),'utf8');expect(composed).toContain('<bdi dir="auto">');
  const validation={state:'Passed' as const,signature:'current',checks:[],at:'2026-11-18',hashes:{}};w.validation=validation;const sessionId=w.session!.id;await store.preparePreview(w.id,input);expect(w.session!.id).toBe(sessionId);expect(w.validation).toBe(validation);expect(await readFile(join(candidate,file),'utf8')).toBe(composed);expect(runtime).toHaveBeenCalledTimes(2);
  await writeFile(join(candidate,file),composed+'// tampered');await expect(store.preparePreview(w.id,input)).rejects.toThrow('STALE_CANDIDATE_SOURCE');expect(await readFile(join(root,file),'utf8')).toBe(before);
 }finally{if(candidate)await rm(candidate,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
});
it('refuses automatic preparation for wrong identities, missing routes, unsupported fixes and rejected decisions',async()=>{
 const {root,store}=await previewFixture();try{
  const {configuredMapping,loadPreviewConfiguration}=await import('../src/preview-configuration.js');const report=await scan(root),w=await store.begin({...report,mode:'one-by-one'}),entry=w.entries.find(e=>e.patch)!,route=configuredMapping(entry.finding,await loadPreviewConfiguration(root)).routes[0];const input={findingId:entry.finding.id,application:route.application,routeId:route.id,inputDigest:report.inputDigest,policyDigest:report.policyDigest};
  await expect(store.preparePreview(w.id,{...input,inputDigest:'stale'})).rejects.toThrow('PREVIEW_SOURCE_IDENTITY_MISMATCH');await expect(store.preparePreview(w.id,{...input,routeId:'unrelated'})).rejects.toThrow('PREVIEW_MAPPING_UNAVAILABLE');const unsupported=w.entries.find(e=>!e.patch)!;await expect(store.preparePreview(w.id,{...input,findingId:unsupported.finding.id})).rejects.toThrow();await store.change(w.id,entry.finding.id,{action:'Rejected'});await expect(store.preparePreview(w.id,input)).rejects.toThrow('PREVIEW_DECISION_REJECTED');expect(w.session).toBeUndefined();
 }finally{await rm(root,{recursive:true,force:true})}
});

it('starts a separate review explicitly, retaining read-only history and blocking historical decisions and Apply',async()=>{
 const {root,store}=await fixture();let candidate:string|undefined;
 try{
  const report=await scan(root),old=await store.begin({...report,mode:'one-by-one'}),entry=old.entries.find(e=>e.patch)!;
  await store.change(old.id,entry.finding.id,{action:'apply'});candidate=old.session!.candidateRoot;await store.change(old.id,entry.finding.id,{action:'Accepted',notes:'Historical note'});const before=await readFile(join(root,file),'utf8');
  const fresh=await store.begin({...report,mode:'one-by-one',restart:true});expect(fresh.id).not.toBe(old.id);expect(fresh.entries.every(e=>e.decision==='Pending'&&!e.notes&&!e.history.length)).toBe(true);expect(fresh.session).toBeUndefined();expect(fresh.validation).toBeUndefined();expect(old.supersededBy).toBe(fresh.id);expect(old.entries.find(e=>e.finding.id===entry.finding.id)?.notes).toBe('Historical note');expect(await readFile(join(root,file),'utf8')).toBe(before);
  await expect(store.change(old.id,entry.finding.id,{action:'Rejected'})).rejects.toThrow('HISTORICAL_REVIEW_LOCKED');await expect(store.validate(old.id)).rejects.toThrow('HISTORICAL_REVIEW_LOCKED');await expect(store.apply(old.id,'APPLY_CONFIRMED')).rejects.toThrow('HISTORICAL_REVIEW_LOCKED');
 }finally{if(candidate)await rm(candidate,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
});

it('blocks Apply when a matching Passed record lacks required execution or candidate-hash evidence',async()=>{
 const {root,store}=await fixture();let candidate:string|undefined;
 try{
  const report=await scan(root),w=await store.begin({...report,mode:'one-by-one'}),entry=w.entries.find(e=>e.patch)!;const before=await readFile(join(root,file),'utf8');await store.change(w.id,entry.finding.id,{action:'apply'});candidate=w.session!.candidateRoot;await store.change(w.id,entry.finding.id,{action:'Accepted'});
  w.validation={state:'Passed',signature:hash(JSON.stringify([entry.patch])),checks:[],hashes:{},at:new Date().toISOString()};await expect(store.apply(w.id,'APPLY_CONFIRMED')).rejects.toThrow('VALIDATION_EVIDENCE_MISSING');expect(await readFile(join(root,file),'utf8')).toBe(before);
 }finally{if(candidate)await rm(candidate,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
});
describe('one-by-one Live After matches the selected finding',()=>{
 async function prepared(){
  const {root,store}=await previewFixture();const {configuredMapping,loadPreviewConfiguration}=await import('../src/preview-configuration.js');const {vi}=await import('vitest');
  const report=await scan(root),w=await store.begin({...report,mode:'one-by-one'}),supported=w.entries.filter(e=>e.patch);expect(supported.length).toBeGreaterThanOrEqual(2);
  vi.spyOn(store,'runtime').mockImplementation(async()=>{w.session!.runtime={status:'healthy',port:4202,origin:'http://127.0.0.1:4202'};return w;});
  const route=configuredMapping(supported[0].finding,await loadPreviewConfiguration(root)).routes[0];
  const input=(e:typeof supported[number])=>({findingId:e.finding.id,application:route.application,routeId:route.id,inputDigest:report.inputDigest,policyDigest:report.policyDigest});
  const expected=(e:typeof supported[number])=>composeWorkflowFile(w.baseline[file],[e.patch!]);
  const candidate=async()=>readFile(join(w.session!.candidateRoot,file),'utf8');
  return {root,store,w,supported,input,expected,candidate};
 }
 it('shows only the opened finding in both opening orders and after switching back',async()=>{
  const {root,store,w,supported,input,expected,candidate}=await prepared();let dir:string|undefined;
  try{
   const [a,b]=supported;
   await store.preparePreview(w.id,input(a));dir=w.session!.candidateRoot;expect(await candidate()).toBe(expected(a));
   await store.preparePreview(w.id,input(b));expect(await candidate()).toBe(expected(b));expect(a.applied).toBe(false);expect(b.applied).toBe(true);
   await store.preparePreview(w.id,input(a));expect(await candidate()).toBe(expected(a));expect(b.applied).toBe(false);
   await store.preparePreview(w.id,input(b));expect(await candidate()).toBe(expected(b));await store.preparePreview(w.id,input(b));expect(await candidate()).toBe(expected(b));
   expect(w.entries.every(e=>e.decision==='Pending')).toBe(true);
  }finally{if(dir)await rm(dir,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
 });
 it('keeps accepted membership and validation while previewing another finding, and restores the accepted candidate',async()=>{
  const {root,store,w,supported,input,expected,candidate}=await prepared();let dir:string|undefined;
  try{
   const [a,b]=supported;
   await store.preparePreview(w.id,input(a));dir=w.session!.candidateRoot;await store.change(w.id,a.finding.id,{action:'Accepted'});
   const validation={state:'Passed' as const,signature:'accepted',checks:[],at:'2026-11-22',hashes:{}};w.validation=validation;
   await store.preparePreview(w.id,input(b));expect(await candidate()).toBe(expected(b));expect(a.decision).toBe('Accepted');expect(a.applied).toBe(true);expect(w.validation).toBe(validation);
   await store.preparePreview(w.id,input(a));expect(await candidate()).toBe(expected(a));
   await store.preparePreview(w.id,input(b));
   await (store as unknown as {restoreAcceptedCandidate:(w:unknown)=>Promise<void>}).restoreAcceptedCandidate(w);
   expect(await candidate()).toBe(expected(a));expect(b.applied).toBe(false);expect(b.decision).toBe('Pending');expect(w.previewFocus).toBeUndefined();expect(w.validation).toBe(validation);
   await store.change(w.id,a.finding.id,{action:'Rejected'});expect(await candidate()).toBe(w.baseline[file]);
  }finally{if(dir)await rm(dir,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
 });
 it('keeps contextual preview identity checks consistent with the focused candidate',async()=>{
  const {root,store,w,supported,input,expected,candidate}=await prepared();let dir:string|undefined;
  try{
   const {contextualPreview}=await import('../src/contextual-preview.js');const [a,b]=supported;
   await store.preparePreview(w.id,input(a));dir=w.session!.candidateRoot;await store.change(w.id,a.finding.id,{action:'Accepted'});
   await store.preparePreview(w.id,input(b));expect(await candidate()).toBe(expected(b));
   const query=(e:typeof a)=>new URLSearchParams({inputDigest:w.inputDigest,policyDigest:w.policyDigest,findingId:e.finding.id,routeId:input(e).routeId,mode:'ltr'});
   await expect(contextualPreview(root,query(b),w)).resolves.toBeTruthy();await expect(contextualPreview(root,query(a),w)).resolves.toBeTruthy();
   await writeFile(join(dir,file),(await candidate())+'// tampered');await expect(contextualPreview(root,query(b),w)).rejects.toThrow('STALE_CANDIDATE_SOURCE');
  }finally{if(dir)await rm(dir,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
 });
 it('leaves batch review composition unchanged',async()=>{
  const {root,store}=await previewFixture();let dir:string|undefined;
  try{
   const report=await scan(root),w=await store.begin({...report,mode:'apply-first'}),supported=w.entries.filter(e=>e.patch);
   for(const e of supported)e.applied=true;await store.rebuild(w);dir=w.session?.candidateRoot;
   expect(w.previewFocus).toBeUndefined();expect(await readFile(join(dir!,file),'utf8')).toBe(composeWorkflowFile(w.baseline[file],supported.map(e=>e.patch!)));
  }finally{if(dir)await rm(dir,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
 });
});
