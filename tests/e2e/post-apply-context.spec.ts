import {enterReview} from './enter-review';
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const companion='http://127.0.0.1:4318',invoice='apps/invoicing/src/components/InvoiceTable.tsx';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
test('source apply and rollback reconcile current previews without migrating historical approvals',async({page,request},info)=>{
  test.setTimeout(240_000);
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));
  if(!env.project.includes('rtl-analyzer-e2e-')||env.project.includes('EDczGl'))throw Error('FRESH_DISPOSABLE_TARGET_REQUIRED');
  const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const a=report.findings.find((f:any)=>f.path===invoice&&f.original==='{i.id}');
  const events:any[]=[],evidence:any[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('request',r=>{if(r.method()==='POST')events.push({url:r.url(),body:r.postDataJSON()})});
  const snapshot=()=>request.get(companion+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'})).then(r=>r.json()).then(r=>r.workflow);
  async function capture(stage:string){const w=await snapshot();const runtimes:any={};for(const origin of ['http://127.0.0.1:4200',w?.session?.runtime?.origin].filter(Boolean)){try{runtimes[origin]=await request.get(origin+'/__rtl_preview_identity').then(r=>r.json())}catch{}}const row={stage,report:{inputDigest:report.inputDigest,policyDigest:report.policyDigest},activeReport:await page.evaluate(()=>{const d=JSON.parse(document.getElementById('rtl-dashboard-data')!.textContent!);return {inputDigest:d.inputDigest,policyDigest:d.policyDigest,findings:d.findings,selected:new URL(location.href).searchParams.get('finding')}}),sourceHashes:Object.fromEntries(Object.keys(w?.validation?.hashes||{[invoice]:''}).map(path=>[path,sha(readFileSync(join(env.project,path),'utf8'))])),sourceHash:sha(readFileSync(join(env.project,invoice),'utf8')),workflow:w,runtimes,states:await page.locator('.embedded-state').allTextContents()};evidence.push(row);writeFileSync(info.outputPath('identity-transitions.json'),JSON.stringify({evidence,events},null,2));return w}
  const original=readFileSync(join(env.project,invoice),'utf8');
  page.on('dialog',d=>d.accept());
  await page.goto('?finding='+encodeURIComponent(a.id),{waitUntil:'domcontentloaded'});
  await enterReview(page);
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
  await capture('analyzed');
  await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});
  await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
  await page.getByRole('button',{name:'Approve fix',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('1 accepted');
  await page.getByRole('button',{name:/^Validate \d+ accepted changes$/}).click();
  await expect(page.locator('.workflow-validation')).toContainText('Validation: Passed',{timeout:180_000});
  const before=await capture('validated');
  await page.getByRole('button',{name:/^Apply \d+ accepted changes to source$/}).click();
  await expect(page.locator('.workflow-summary')).toContainText('Applied');
  const applied=await capture('applied');expect(applied.receipts).toHaveLength(1);expect(applied.id).toBe(before.id);expect(applied.inputDigest).toBe(before.inputDigest);expect(applied.session.id).toBe(before.session.id);expect(evidence.at(-1).activeReport.inputDigest).not.toBe(report.inputDigest);expect(evidence.at(-1).sourceHashes).toEqual(applied.validation.hashes);await page.getByRole('button',{name:'Review details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByRole('tab',{name:'Technical',exact:true}).click();await expect(page.locator('.workflow-receipts')).toContainText(applied.receipts[0].auditId);await page.keyboard.press('Escape');
  const legacyQuery=new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,findingId:a.id,workflowId:before.id,mode:'ltr'});
  const stale=await request.get(companion+'/contextual-preview?'+legacyQuery).then(r=>r.json());
  evidence.push({stage:'old-context-after-apply',response:stale});
  if(process.env.RTL_REPRO_POST_APPLY){
    expect(stale.error).toBe('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
    await expect(page.locator('.component-before .embedded-state')).toContainText('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
    await page.screenshot({path:info.outputPath('reproduced-post-apply.png'),fullPage:true});
    await page.reload({waitUntil:'domcontentloaded'});await enterReview(page);
    await expect(page.locator('.component-before .embedded-state')).toContainText('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
    await capture('reload-reproduced');return;
  }
  expect(stale.error).toBe('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  // The current report, ranges and source are refreshed; historical decisions remain in their workflow.
  await expect(page.locator('.decision-card .source-context-status')).toContainText('Source applied');await expect(page.locator('.decision-card')).not.toContainText(before.inputDigest);await page.getByRole('button',{name:'Review details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByRole('tab',{name:'Technical',exact:true}).click();await expect(page.getByRole('dialog',{name:'Review details'})).toContainText('Historical Before preview unavailable');await page.keyboard.press('Escape');
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
  await expect(page.locator('.component-before .preview-status')).toHaveText('Current source');
  await expect(page.locator('.component-after .preview-status')).toHaveText('No candidate');
  await expect(page.frameLocator('.component-before iframe').locator('.invoice-link > bdi').first()).toHaveText(/INV-/);
  const select=async(original:string)=>{await page.locator('button.file').filter({hasText:'InvoiceTable.tsx'}).click();const current=await page.evaluate(()=>JSON.parse(document.getElementById('rtl-dashboard-data')!.textContent!));const f=Object.values(current.queue).flat().find((f:any)=>f.path===invoice&&(original==='{i.id}'?f.eligibility==='AUTOMATED_ELIGIBLE':f.line===report.findings.find((x:any)=>x.path===invoice&&x.original===original).range.start.line)) as any;expect(f).toBeTruthy();await page.locator('button.finding').filter({hasText:f.path+':'+f.line+':'+f.column}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});return f};
  const unsupported=await select('{money(total(i), i.currency)}');await expect(page.locator('.after-card pre')).toContainText('AMBIGUOUS_TOKEN_EXPRESSION');
  const currentSupported=await select('{i.id}');expect(currentSupported.column).not.toBe(a.range.start.column);
  await expect(page.getByRole('button',{name:'Approve fix',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Expand original preview',exact:true}).click();await page.screenshot({path:info.outputPath('post-apply-current.png')});await page.getByRole('button',{name:'Close',exact:true}).click();
  const active=await page.evaluate(()=>JSON.parse(document.getElementById('rtl-dashboard-data')!.textContent!));const procurement=Object.values(active.queue).flat().find((f:any)=>f.path==='apps/procurement/src/App.tsx'&&f.eligibility==='AUTOMATED_ELIGIBLE') as any;await page.locator('button.file[data-source-path="'+procurement.path+'"]').click();await page.locator('button.finding').filter({hasText:procurement.path+':'+procurement.line+':'+procurement.column}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});expect(await page.frameLocator('.component-before iframe').locator('body').evaluate(()=>location.port)).toBe('4201');await page.getByRole('button',{name:'Expand original preview',exact:true}).click();await page.screenshot({path:info.outputPath('post-apply-procurement.png')});await page.getByRole('button',{name:'Close',exact:true}).click();
  const posts=events.filter(e=>!e.url.endsWith('/review/codemod/analyze')).length;
  await page.reload({waitUntil:'domcontentloaded'});await enterReview(page);
  await expect(page.locator('.workflow-summary')).toContainText('Applied');await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
  await select('{money(total(i), i.currency)}');await page.getByRole('button',{name:'Expand',exact:true}).click();await page.screenshot({path:info.outputPath('post-apply-unsupported.png')});await page.getByRole('button',{name:'Close',exact:true}).click();
  expect(events.filter(e=>!e.url.endsWith('/review/codemod/analyze')).length).toBe(posts);const restored=await capture('reload-current');expect(restored.id).toBe(before.id);expect(restored.session.id).toBe(before.session.id);expect(restored.receipts).toEqual(applied.receipts);expect(restored.entries).toEqual(applied.entries);expect(restored.validation).toEqual(applied.validation);
  for(const receipt of restored.receipts){expect(sha(readFileSync(receipt.backupPath,'utf8'))).toBe(receipt.originalSha256);expect(sha(readFileSync(join(env.project,receipt.path),'utf8'))).toBe(receipt.appliedSha256)}
  // A later edit is not an authorized identity transition.
  const appliedSource=readFileSync(join(env.project,invoice),'utf8');writeFileSync(join(env.project,invoice),appliedSource+'\n// unexpected external change\n');
  await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toContainText('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('.source-context-status').filter({hasText:'Source context blocked:'}).last()).toContainText('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  writeFileSync(join(env.project,invoice),appliedSource);await page.reload({waitUntil:'domcontentloaded'});await enterReview(page);await expect(page.locator('.workflow-summary')).toContainText('Applied');
  await page.locator('.session-overflow > summary').click();await page.getByRole('menuitem',{name:'Rollback accepted changes',exact:true}).click();await expect(page.locator('.source-context-status')).toContainText('Automatic rescan complete');
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
  expect(readFileSync(join(env.project,invoice),'utf8')).toBe(original);await expect(page.frameLocator('.component-before iframe').locator('.invoice-link bdi')).toHaveCount(0);
  await page.getByRole('button',{name:'Expand original preview',exact:true}).click();await page.screenshot({path:info.outputPath('post-rollback-current.png')});await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload({waitUntil:'domcontentloaded'});await enterReview(page);await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});await capture('rolled-back-reloaded');expect(events.filter(e=>/\/apply$/.test(e.url))).toHaveLength(1);expect(events.filter(e=>e.body.action==='apply')).toHaveLength(0);expect(errors).toEqual([]);
});
