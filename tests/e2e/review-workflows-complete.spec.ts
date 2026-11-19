import {enterReview} from './enter-review';
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, chmodSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';

const origin='http://127.0.0.1:4318';
const invoice='apps/invoicing/src/components/InvoiceTable.tsx',tokens='apps/invoicing/src/components/ReviewTokens.tsx';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
test.describe.configure({mode:'serial'});
for(const mode of ['one-by-one','apply-first'] as const)test(mode+' completes actual UI review, validation, accepted source application and protected rollback',async({page,request},info)=>{
  test.setTimeout(240_000);
  const root=info.config.metadata.portableFixtureRoot as string;
  if(!root?.includes('rtl-analyzer-e2e-'))throw Error('DISPOSABLE_TARGET_REQUIRED');
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));
  const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const snapshot=()=>request.get(origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode})).then(r=>r.json()).then(r=>r.workflow);
  const before=Object.fromEntries([invoice,tokens].map(p=>[p,readFileSync(join(root,p),'utf8')]));
  const network:any[]=[],errors:string[]=[];
  page.on('request',r=>{if(r.url().includes('/review/workflows')&&r.method()==='POST')network.push({url:r.url(),body:r.postDataJSON()})});
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  const invoiceFindings=report.findings.filter((f:any)=>f.path===invoice&&f.original==='{i.id}');
  const tokenFindings=report.findings.filter((f:any)=>f.path===tokens&&f.original==='{item.id}');
  const [a,b]=invoiceFindings,[c,d]=tokenFindings;
  const unsupported=report.findings.find((f:any)=>f.path===invoice&&f.original==='{money(total(i), i.currency)}');
  expect(invoiceFindings).toHaveLength(2);expect(tokenFindings).toHaveLength(2);
  async function select(f:any){
    const url=new URL(page.url());url.searchParams.set('finding',f.id);
    // Use the existing file tree and finding list, so switching is a real UI action.
    const name=f.path.split('/').at(-1)!;
    const file=page.locator('button.file').filter({hasText:name});
    if(await file.count())await file.click();
    const row=page.locator('button.finding').filter({hasText:f.path+':'+f.range.start.line+':'+f.range.start.column});
    await row.click();
    await expect(page.locator('.before-card pre')).toHaveText(f.original);
  }
  const waitSaved=(findingId:string,decision:string)=>expect.poll(async()=>{const w=await snapshot();return w?.entries.find((e:any)=>e.finding.id===findingId).decision}).toBe(decision);
  const selectAndApply=async(f:any)=>{await select(f);await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});await expect.poll(async()=>{const w=await snapshot();return w.entries.find((e:any)=>e.finding.id===f.id).applied}).toBe(true)};
  const decide=async(f:any,label:string,decision:string)=>{await select(f);await page.getByRole('button',{name:label,exact:true}).click();await waitSaved(f.id,decision)};
  const blocker=createServer((_q,r)=>r.end('unrelated-port-owner'));await new Promise<void>((resolve,reject)=>{blocker.once('error',reject);blocker.listen(4202,'127.0.0.1',resolve)});
  try{
    let failRuntime=true;await page.route('**/review/workflows/*/prepare-preview',route=>{if(failRuntime){failRuntime=false;return route.fulfill({status:503,contentType:'application/json',headers:{'access-control-allow-origin':'http://127.0.0.1:4320'},body:JSON.stringify({error:'SIMULATED_PREPARATION_FAILURE'})})}return route.continue()});
    await page.goto('?finding='+encodeURIComponent(a.id),{waitUntil:'domcontentloaded'});
    await enterReview(page,mode);
    await expect(page.locator('.session-identity')).toHaveAttribute('title',mode==='one-by-one'?'One by one review':'Prepare all, then review');
    let w=await snapshot();const id=w.id;
    expect(w.inputDigest).toBe(report.inputDigest);expect(w.policyDigest).toBe(report.policyDigest);expect(w.root).toBe(root);
    const eligible=w.entries.filter((e:any)=>e.patch);
    if(mode==='one-by-one'){expect(w.session).toBeUndefined();expect(eligible.every((e:any)=>!e.applied)).toBe(true)}
    else {expect(w.session).toBeTruthy();expect(eligible.every((e:any)=>e.applied&&e.decision==='Pending')).toBe(true);for(const f of w.files)expect(readFileSync(join(w.session.candidateRoot,f.path),'utf8')).toBe(f.after)}
    expect(w.entries.filter((e:any)=>!e.patch).every((e:any)=>!e.applied&&e.reason)).toBe(true);
    expect(readFileSync(join(root,invoice),'utf8')).toBe(before[invoice]);
    await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:25_000});
    await expect(page.locator('.component-after .embedded-state')).toContainText('SIMULATED_PREPARATION_FAILURE');
    const retrySession=(await snapshot()).session?.id;await page.getByRole('button',{name:'Retry preview',exact:true}).click();
    await expect.poll(async()=>(await snapshot()).session?.runtime?.status).toBe('healthy');
    if(retrySession)expect((await snapshot()).session.id).toBe(retrySession);
    expect(network.filter(e=>e.url.endsWith('/prepare-preview')&&e.body.findingId===a.id)).toHaveLength(2);
    expect(network.filter(e=>e.body.action==='apply'&&e.body.findingId===a.id)).toHaveLength(0);
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
    const beforeFrame=page.frameLocator('iframe[title="Before: original application route"]'),afterFrame=page.frameLocator('iframe[title="After: isolated candidate application route"]');
    await expect(beforeFrame.locator('.invoice-link bdi')).toHaveCount(0);
    await expect(afterFrame.locator('.invoice-link > bdi').first()).toHaveText(/INV-/);
    w=await snapshot();expect(w.session.runtime.port).not.toBe(4202);
    expect(await request.get(w.session.runtime.origin+'/__rtl_preview_identity').then(r=>r.json())).toMatchObject({projectRoot:w.session.candidateRoot,sessionId:w.session.id,sourceSha256:w.session.candidateSha256});
    expect(await request.get('http://127.0.0.1:4200/__rtl_preview_identity').then(r=>r.json())).toMatchObject({projectRoot:root,role:'original'});
    const candidateId=w.session.id,candidateRoot=w.session.candidateRoot;
    await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});
    await expect.poll(async()=>(await snapshot()).session.id).toBe(candidateId);
    expect((await request.get('http://127.0.0.1:4202/')).ok()).toBe(true);
    await page.locator('.component-toolbar').getByRole('button',{name:'RTL',exact:true}).click();await expect(beforeFrame.locator('html')).toHaveAttribute('dir','rtl');await expect(afterFrame.locator('html')).toHaveAttribute('dir','rtl');
    await page.getByRole('button',{name:'Desktop',exact:true}).click();expect(await afterFrame.locator('body').evaluate(()=>innerWidth)).toBe(768);
    await page.getByRole('button',{name:'Tablet',exact:true}).click();expect(await afterFrame.locator('body').evaluate(()=>innerWidth)).toBe(390);
    await page.getByRole('button',{name:'Expand',exact:true}).click();await expect(page.locator('.embedded-expanded')).toBeVisible();await page.screenshot({path:info.outputPath('expanded-rtl.png'),fullPage:true});await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.locator('.component-toolbar').getByRole('button',{name:'LTR',exact:true}).click();
    await decide(a,'Approve fix','Accepted');
    if(mode==='one-by-one')await selectAndApply(b);
    await decide(b,'Reject fix','Rejected');
    const invoiceCandidate=readFileSync(join(candidateRoot,invoice),'utf8');expect(invoiceCandidate).toContain('<bdi dir="auto">{i.id}</bdi>');expect(invoiceCandidate).toContain('className="review-extra-id">{i.id}</span>');
    if(mode==='one-by-one')await selectAndApply(c);
    await decide(c,'Approve fix','Accepted');
    await decide(d,'Defer','Deferred');
    await decide(unsupported,'Needs review','Flagged');
    await expect(page.locator('.after-card pre')).toContainText('No supported automatic fix');await expect(page.locator('.component-before iframe')).toHaveCount(1);await expect(page.locator('.component-helper')).toContainText('No automatic fix');
    await page.reload({waitUntil:'domcontentloaded'});await enterReview(page,mode);await expect(page.locator('.workflow-summary')).toContainText('2 accepted');
    expect((await snapshot()).id).toBe(id);expect((await snapshot()).entries.find((e:any)=>e.finding.id===b.id).decision).toBe('Rejected');
    // Actual Companion outage and restart, no test-only route stubs for the service.
    process.kill(env.supervisorPid,'SIGUSR1');await expect.poll(async()=>request.get(origin+'/health').then(r=>r.ok()).catch(()=>false)).toBe(false);
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.analysis-status')).toContainText('COMPANION_UNAVAILABLE');
    process.kill(env.supervisorPid,'SIGUSR2');await expect.poll(async()=>request.get(origin+'/health',{timeout:1000}).then(r=>r.ok()).catch(()=>false),{timeout:15_000}).toBe(true);
    await page.getByRole('button',{name:'Retry connection',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('2 accepted');expect((await snapshot()).session.id).toBe(candidateId);
    // Original-source conflict must surface in the real UI, without losing decisions.
    writeFileSync(join(root,invoice),before[invoice]+'\n// concurrent user edit\n');
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.analysis-status')).toContainText('STALE_ORIGINAL_SOURCE');expect(readFileSync(join(root,invoice),'utf8')).toContain('concurrent user edit');writeFileSync(join(root,invoice),before[invoice]);
    const candidateBeforeConflict=readFileSync(join(candidateRoot,invoice),'utf8');writeFileSync(join(candidateRoot,invoice),candidateBeforeConflict+'// candidate tamper');
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.analysis-status')).toContainText('STALE_CANDIDATE_SOURCE');writeFileSync(join(candidateRoot,invoice),candidateBeforeConflict);
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();
    await expect(page.locator('.workflow-validation')).toContainText('Validation: Passed',{timeout:180_000});
    w=await snapshot();expect(w.validation.checks.filter((x:any)=>x.state==='Failed')).toHaveLength(0);
    await page.screenshot({path:info.outputPath('validated-dashboard.png'),fullPage:true});
    page.on('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:/^Apply \d+ accepted changes? to source$/}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied');
    w=await snapshot();expect(w.receipts).toHaveLength(2);
    for(const f of w.files)if(![invoice,tokens].includes(f.path))expect(readFileSync(join(root,f.path),'utf8')).toBe(f.before);
    // Receipts and final state survive service restart and dashboard reload before rollback.
    process.kill(env.supervisorPid,'SIGUSR1');await expect.poll(async()=>request.get(origin+'/health').then(r=>r.ok()).catch(()=>false)).toBe(false);process.kill(env.supervisorPid,'SIGUSR2');await expect.poll(async()=>request.get(origin+'/health',{timeout:1000}).then(r=>r.ok()).catch(()=>false),{timeout:15_000}).toBe(true);
    await page.reload({waitUntil:'domcontentloaded'});await enterReview(page,mode);await expect(page.locator('.workflow-summary')).toContainText('Applied');

    for(const r of w.receipts){expect(sha(readFileSync(join(root,r.path),'utf8'))).toBe(r.appliedSha256);expect(sha(readFileSync(r.backupPath,'utf8'))).toBe(r.originalSha256)}
    expect(readFileSync(join(root,invoice),'utf8')).toContain('className="review-extra-id">{i.id}</span>');expect(readFileSync(join(root,tokens),'utf8')).toContain('className="token-two">{item.id}</span>');
    const applied=readFileSync(join(root,invoice),'utf8');writeFileSync(join(root,invoice),applied+'\n// later edit\n');
    await page.locator('.session-overflow > button').click();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();await expect(page.locator('.analysis-status')).toContainText('ROLLBACK_CONFLICT');expect(readFileSync(join(root,invoice),'utf8')).toContain('later edit');
    const unrelated=report.files.find((p:string)=>p.endsWith('.tsx')&&![invoice,tokens].includes(p));const unrelatedBefore=readFileSync(join(root,unrelated),'utf8');writeFileSync(join(root,unrelated),unrelatedBefore+'\n// unrelated user edit\n');
    writeFileSync(join(root,invoice),applied);await page.locator('.session-overflow > button').click();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('Rolled Back');expect(readFileSync(join(root,unrelated),'utf8')).toContain('unrelated user edit');writeFileSync(join(root,unrelated),unrelatedBefore);
    for(const p of [invoice,tokens])expect(readFileSync(join(root,p),'utf8')).toBe(before[p]);
    expect(errors).toEqual([]);
    writeFileSync(info.outputPath('acceptance.json'),JSON.stringify({mode,workflow:w,network,errors,originalHashes:Object.fromEntries(Object.entries(before).map(([p,t])=>[p,sha(t)])),restoredHashes:Object.fromEntries([invoice,tokens].map(p=>[p,sha(readFileSync(join(root,p),'utf8'))]))},null,2));
  }finally{await new Promise<void>(resolve=>blocker.close(()=>resolve()))}
});

test('unavailable runtime and failed configured checks stay distinct and block final source application',async({page,request},info)=>{
  test.setTimeout(240_000);
  const root=info.config.metadata.portableFixtureRoot as string;
  if(!root?.includes('rtl-analyzer-e2e-'))throw Error('DISPOSABLE_TARGET_REQUIRED');
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));
  const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const f=report.findings.find((f:any)=>f.path===invoice&&f.original==='{i.id}');
  const original=readFileSync(join(root,invoice),'utf8');
  const pkgPath=join(root,'package.json'),pkg=readFileSync(pkgPath,'utf8');
  const servers:ReturnType<typeof createServer>[]=[];
  const open=async()=>{await page.goto('?finding='+encodeURIComponent(f.id),{waitUntil:'domcontentloaded'});await enterReview(page);await page.locator('.session-overflow > button').click();await page.getByRole('menuitem',{name:'Start new review',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('0 accepted');await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:25_000});await page.getByRole('button',{name:'Approve fix',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('1 accepted')};
  try{
    await open();
    await page.route('**/review/workflows/*/prepare-preview',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'PORT_POOL_TEST_HOLD'})}));
    process.kill(env.supervisorPid,'SIGUSR1');await expect.poll(()=>request.get(origin+'/health',{timeout:500}).then(r=>r.ok()).catch(()=>false)).toBe(false);process.kill(env.supervisorPid,'SIGUSR2');await expect.poll(()=>request.get(origin+'/health',{timeout:1000}).then(r=>r.ok()).catch(()=>false),{timeout:15000}).toBe(true);
    // Occupy the bounded pool with disposable unrelated owners; don't terminate existing owners.
    for(let port=4202;port<=4212;port++){const server=createServer((_q,r)=>r.end('occupied'));const opened=await new Promise<boolean>(resolve=>{server.once('error',()=>resolve(false));server.listen(port,'127.0.0.1',()=>resolve(true))});if(opened)servers.push(server)}
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.workflow-validation')).toContainText('Validation: Unavailable',{timeout:180_000});await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('tab',{name:'Validation',exact:true}).click();await expect(page.getByRole('dialog',{name:'Session details'})).toContainText('CANDIDATE_PORT_POOL_EXHAUSTED');await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:/^Apply \d+ accepted changes? to source$/})).toHaveCount(0);
    await page.screenshot({path:info.outputPath('unavailable-check.png'),fullPage:true});
    await page.unroute('**/review/workflows/*/prepare-preview');
    await Promise.all(servers.splice(0).map(s=>new Promise<void>(resolve=>s.close(()=>resolve()))));
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.workflow-validation')).toContainText('Validation: Passed',{timeout:180_000});
    page.on('dialog',d=>d.accept());await page.getByRole('button',{name:/^Apply \d+ accepted changes? to source$/}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied');await page.locator('.session-overflow > button').click();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();await expect(page.locator('.source-context-status')).toContainText('Automatic rescan complete');
    const failedPackage=JSON.parse(pkg);failedPackage.scripts.test='node --eval "process.exit(7)"';writeFileSync(pkgPath,JSON.stringify(failedPackage));
    await open();await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.workflow-validation')).toContainText('Validation: Failed',{timeout:180_000});await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('tab',{name:'Validation',exact:true}).click();await expect(page.getByRole('dialog',{name:'Session details'}).locator('.validation-check[data-status=Failed]').filter({has:page.getByText('test',{exact:true})})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:/^Apply \d+ accepted changes? to source$/})).toHaveCount(0);expect(readFileSync(join(root,invoice),'utf8')).toBe(original);
    await page.screenshot({path:info.outputPath('failed-check.png'),fullPage:true});
    const snapshot=await request.get(origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'})).then(r=>r.json());writeFileSync(info.outputPath('failed-validation.json'),JSON.stringify(snapshot,null,2));
  }finally{writeFileSync(pkgPath,pkg);await Promise.all(servers.map(s=>new Promise<void>(resolve=>s.close(()=>resolve()))))}
});

test('workflow endpoints protect origin, report identity, scope and final-apply authorization',async({request},info)=>{
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8')),report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const root=info.config.metadata.portableFixtureRoot as string;if(!root.includes('rtl-analyzer-e2e-'))throw Error('DISPOSABLE_TARGET_REQUIRED');
  const before=readFileSync(join(root,invoice),'utf8');
  const input={inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'apply-first',scope:[]};
  expect((await request.post(origin+'/review/workflows',{data:input})).status()).toBe(403);
  const headers={Origin:'http://127.0.0.1:4320'};
  expect((await request.post(origin+'/review/workflows',{headers,data:{...input,scope:['../escape']}}).then(r=>r.json())).error).toBe('WORKFLOW_SCOPE_MISMATCH');
  expect((await request.post(origin+'/review/workflows',{headers,data:{...input,inputDigest:'wrong'}}).then(r=>r.json())).error).toBe('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  const latest=await request.get(origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'})).then(r=>r.json());
  expect((await request.post(origin+'/review/workflows/'+latest.workflow.id+'/apply',{headers,data:{confirmation:'APPLY_CONFIRMED'}}).then(r=>r.json())).error).toBe('VALIDATED_ACCEPTED_CANDIDATE_REQUIRED');
  expect((await request.get(origin+'/review/workflows/'+latest.workflow.id+'/preview?findingId=unrelated&mode=ltr').then(r=>r.json())).error).toBe('LIVE_PREVIEW_MAPPING_UNAVAILABLE');
  expect(readFileSync(join(root,invoice),'utf8')).toBe(before);
});

test('partial original-source write remains recoverable through scoped UI rollback',async({page,request},info)=>{
  test.setTimeout(180_000);
  const root=info.config.metadata.portableFixtureRoot as string;if(!root?.includes('rtl-analyzer-e2e-'))throw Error('DISPOSABLE_TARGET_REQUIRED');
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8')),report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const first=report.findings.find((f:any)=>f.path===invoice&&f.original==='{i.id}'),second=report.findings.find((f:any)=>f.path==='apps/procurement/src/App.tsx'&&f.original==='{o.id}');
  const before=readFileSync(join(root,invoice),'utf8'),secondBefore=readFileSync(join(root,second.path),'utf8'),directory=dirname(join(root,second.path)),mode=statSync(directory).mode&0o777;
  try{
    await page.goto('?finding='+encodeURIComponent(first.id),{waitUntil:'domcontentloaded'});await enterReview(page,'apply-first');await expect(page.locator('.session-identity')).toHaveAttribute('title','Prepare all, then review');await page.locator('.session-overflow > button').click();await page.getByRole('menuitem',{name:'Start new review',exact:true}).click();
    await expect(page.getByRole('button',{name:'Approve fix',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Approve fix',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('1 accepted');
    await page.locator('button.file').filter({hasText:'App.tsx'}).filter({hasText:'App.tsx'}).click();
    await page.locator('button.finding').filter({hasText:second.path+':'+second.range.start.line+':'+second.range.start.column}).click();await page.getByRole('button',{name:'Approve fix',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('2 accepted');
    await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.workflow-validation')).toContainText('Validation: Passed',{timeout:120_000});
    chmodSync(directory,0o500);page.on('dialog',d=>d.accept());await page.getByRole('button',{name:/^Apply \d+ accepted changes? to source$/}).click();await expect(page.locator('.analysis-status')).toContainText('EACCES');await expect(page.locator('.decision-card .source-context-status')).toContainText('Source apply incomplete');
    expect(readFileSync(join(root,invoice),'utf8')).not.toBe(before);expect(readFileSync(join(root,second.path),'utf8')).toBe(secondBefore);
    await page.screenshot({path:info.outputPath('partial-apply.png'),fullPage:true});
    chmodSync(directory,mode);
    process.kill(env.supervisorPid,'SIGUSR1');await expect.poll(async()=>request.get(origin+'/health').then(r=>r.ok()).catch(()=>false)).toBe(false);process.kill(env.supervisorPid,'SIGUSR2');await expect.poll(async()=>request.get(origin+'/health',{timeout:1000}).then(r=>r.ok()).catch(()=>false),{timeout:15_000}).toBe(true);await page.reload({waitUntil:'domcontentloaded'});await enterReview(page,'apply-first');await expect(page.locator('.workflow-summary')).toContainText('Applying');
    await page.locator('.session-overflow > button').click();await expect(page.getByRole('menuitem',{name:'Rollback applied changes',exact:true})).toBeEnabled();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();await expect(page.locator('.source-context-status')).toContainText('Automatic rescan complete');
    expect(readFileSync(join(root,invoice),'utf8')).toBe(before);expect(readFileSync(join(root,second.path),'utf8')).toBe(secondBefore);
    const w=await request.get(origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'apply-first'})).then(r=>r.json());writeFileSync(info.outputPath('partial-recovery.json'),JSON.stringify(w,null,2));
  }finally{chmodSync(directory,mode)}
});
