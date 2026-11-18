import { it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from '../src/scan.js';
import { ReviewWorkflowStore, composeWorkflowFile } from '../src/review-workflow.js';
import { ControlledApplyService, ApplyAuditStore } from '../src/controlled-apply.js';
import { verifiedSourceTransition, reconcileSelectedFinding } from '../src/source-context.js';

it('authorizes only the exact receipt-bound source transition, preserving historical identity and refusing external edits and added scan inputs',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'rtl-context-transition-'))),path='apps/invoicing/src/components/InvoiceTable.tsx';
  try{
    await mkdir(join(root,'apps/invoicing/src/components'),{recursive:true});await mkdir(join(root,'libs'));
    await writeFile(join(root,path),'export const View=({a}:{a:{id:string}})=><span>{a.id}</span>;');
    await writeFile(join(root,'apps/invoicing/index.html'),'<html dir="ltr"><body></body></html>');
    await writeFile(join(root,'apps/invoicing/project.json'),JSON.stringify({sourceRoot:'apps/invoicing/src'}));
    for(const name of ['package.json','nx.json','tsconfig.json'])await writeFile(join(root,name),'{}');
    await writeFile(join(root,'rtl-scanner.config.json'),JSON.stringify({schemaVersion:1,generatedStyleOwner:'unknown',ownership:{},approvals:[],exceptions:[],issueBindings:[],dynamicExceptions:[],roles:[]}));
    const apply=new ControlledApplyService(root,new ApplyAuditStore(join(root,'state/audit.json')),join(root,'state/backups'));
    const store=new ReviewWorkflowStore(root,join(root,'state/workflows.json'),apply),before=await scan(root);
    const w=await store.begin({...before,mode:'one-by-one'}),entry=w.entries.find(e=>e.patch)!;
    entry.applied=true;entry.decision='Accepted';
    const after=composeWorkflowFile(w.baseline[path],[entry.patch!]);
    w.receipts=await apply.applyAcceptedFiles(w.id,[{path,before:w.baseline[path],after}],'APPLY_CONFIRMED');w.state='Applied';
    const current=await scan(root);
    w.validation={state:'Passed',signature:'historical-fixture',hashes:{},at:new Date().toISOString(),checks:[{name:'scanner',state:'Passed',detail:JSON.stringify({before:before.inputDigest,after:current.inputDigest})}]};
    const historical=JSON.stringify(w);
    expect((await verifiedSourceTransition(root,w)).inputDigest).toBe(current.inputDigest);expect(current.inputDigest).not.toBe(before.inputDigest);expect(JSON.stringify(w)).toBe(historical);
    await writeFile(join(root,path),after+'// external edit');await expect(verifiedSourceTransition(root,w)).rejects.toThrow('DASHBOARD_SOURCE_IDENTITY_MISMATCH');await writeFile(join(root,path),after);
    await writeFile(join(root,'apps/invoicing/src/Added.tsx'),'export const Added=()=>null;');await expect(verifiedSourceTransition(root,w)).rejects.toThrow('DASHBOARD_SOURCE_IDENTITY_MISMATCH');await rm(join(root,'apps/invoicing/src/Added.tsx'));
    await writeFile(join(root,'tsconfig.json'),'{"compilerOptions":{}}');await expect(verifiedSourceTransition(root,w)).rejects.toThrow('DASHBOARD_SOURCE_IDENTITY_MISMATCH');await writeFile(join(root,'tsconfig.json'),'{}');
    const receipt=w.receipts[0];w.receipts=[{...receipt,appliedSha256:'wrong'}];await expect(verifiedSourceTransition(root,w)).rejects.toThrow('SOURCE_TRANSITION_RECEIPT_MISMATCH');w.receipts=[receipt];
    await apply.rollbackAcceptedFiles(w.receipts);w.state='Rolled Back';expect((await verifiedSourceTransition(root,w)).inputDigest).toBe(before.inputDigest);
    expect(w.inputDigest).toBe(before.inputDigest);expect(w.validation.state).toBe('Passed');expect(await readFile(receipt.backupPath,'utf8')).toBe(w.baseline[path]);
    const selection=entry.finding,changed={...selection,id:'new-id',range:{start:{...selection.range.start,column:selection.range.start.column+9},end:selection.range.end}};
    expect(reconcileSelectedFinding(selection,{...before,findings:[changed]})).toMatchObject({findingId:'new-id',matched:true});
    const reused={...selection,original:'{a.other}',context:'another context'};
    expect(reconcileSelectedFinding(selection,{...before,findings:[reused,changed]})).toMatchObject({findingId:'new-id',matched:true});
    expect(reconcileSelectedFinding(selection,{...before,findings:[reused]})).toMatchObject({matched:false});
    expect(reconcileSelectedFinding(selection,{...before,findings:[]})).toMatchObject({findingId:null,matched:false});
    expect(reconcileSelectedFinding(selection,before,['apps/missing.tsx'])).toMatchObject({findingId:null,matched:false});
  }finally{await rm(root,{recursive:true,force:true})}
});
