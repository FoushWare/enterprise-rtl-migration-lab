import {enterReview} from './enter-review';
import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const origin='http://127.0.0.1:4318',source='apps/invoicing/src/components/InvoiceTable.tsx';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
test.describe.configure({mode:'serial'});
for(const mode of (process.env.RTL_REPRO_ROLLBACK||process.env.RTL_ROLLBACK_DELIVERY?['one-by-one']:['one-by-one','apply-first']))test(mode+' resumes fresh pending candidate after rollback without historical approval',async({page,request},info)=>{
 test.setTimeout(240000);
 const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));if(!env.project.includes('rtl-analyzer-e2e-'))throw Error('DISPOSABLE_ONLY');
 const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8')),finding=report.findings.find((f:any)=>f.path===source&&f.original==='{i.id}'),original=readFileSync(join(env.project,source),'utf8');
 const events:any[]=[],errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST')events.push({url:r.url(),body:r.postDataJSON()})});page.on('dialog',d=>d.accept());
 const get=(path:string)=>request.get(origin+path).then(r=>r.json());const active=()=>get('/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode})).then(r=>r.workflow);
 await page.goto('?finding='+encodeURIComponent(finding.id),{waitUntil:'domcontentloaded'});await enterReview(page,mode);
 await expect(page.locator('.after-card pre')).toHaveText('<bdi dir="auto">{i.id}</bdi>');await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});
 await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});
 await page.getByRole('button',{name:'Approve fix',exact:true}).click();await page.getByRole('dialog',{name:'Proposed change approved'}).getByRole('button',{name:'Stay on this finding',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('1 accepted');
 await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.locator('.workflow-validation')).toContainText('Validation: Passed',{timeout:180000});
 const historical=await active();await page.getByRole('button',{name:/^Apply \d+ accepted changes? to source$/}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied');expect(readFileSync(join(env.project,source),'utf8')).not.toBe(original);
 const applied=(await get('/review/workflows/'+historical.id)).workflow;
 const appliedData=await page.locator('#rtl-dashboard-data').textContent().then(s=>JSON.parse(s!));expect(appliedData.inputDigest).not.toBe(report.inputDigest);
 let failRescan=mode==='apply-first',held=false,releaseLate!:()=>void,latePayload:any;
 const lateGate=new Promise<void>(resolve=>releaseLate=resolve);
 if(!process.env.RTL_REPRO_ROLLBACK){
   await page.route('**/review/source-context?*',async route=>{if(failRescan)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'RESCAN_TEST_FAILURE'})});await route.continue()});
   // Hold a real pre-rollback context response. Its old document must not update the refreshed one.
   if(mode==='one-by-one'){await page.route('**/contextual-preview?*',async route=>{if(held)return route.continue();held=true;const response=await route.fetch();latePayload=await response.json();await lateGate;await route.fulfill({response}).catch(()=>{})});await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect.poll(()=>!!latePayload).toBe(true);}
 }
 await page.locator('.session-overflow > button').click();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();
 await expect.poll(()=>readFileSync(join(env.project,source),'utf8')).toBe(original);
 if(failRescan){
   await expect(page.locator('.analysis-status')).toContainText('Rollback succeeded. Rescan failed: RESCAN_TEST_FAILURE');await expect(page.locator('.top > .status')).toContainText('REPORT SNAPSHOT · SOURCE UNVERIFIED');await expect(page.getByRole('button',{name:'Retry rescan',exact:true})).toHaveCount(1);await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByRole('tab',{name:'Technical',exact:true}).click();await expect(page.locator('.workflow-receipts')).toContainText(applied.receipts[0].auditId);await page.keyboard.press('Escape');await expect(page.locator('.after-card pre')).toHaveText('Fresh suggestion unavailable until rescan succeeds.');await expect(page.locator('.component-review iframe')).toHaveCount(0);expect((await active()).id).toBe(historical.id);expect((await active()).state).toBe('Rolled Back');await page.screenshot({path:info.outputPath('rollback-succeeded-rescan-failed.png'),fullPage:true});expect(events.filter(e=>e.url.endsWith('/rollback'))).toHaveLength(1);failRescan=false;await page.getByRole('button',{name:'Retry rescan',exact:true}).click();
 }
 await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});
 await expect(page.frameLocator('.component-before iframe').locator('.invoice-link bdi')).toHaveCount(0);
 releaseLate();
 await expect(page.locator('.source-context-status')).toContainText('Automatic rescan complete');
 await page.screenshot({path:info.outputPath(process.env.RTL_REPRO_ROLLBACK?'reproduced-no-suggestion.png':'post-rollback.png'),fullPage:true});
 await expect(page.locator('.after-card pre')).toHaveText('<bdi dir="auto">{i.id}</bdi>');
 await page.locator('.code-diff-card').screenshot({path:info.outputPath('post-rollback-suggestion.png')});
 await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});
 const fresh=await active(),data=await page.locator('#rtl-dashboard-data').textContent().then(s=>JSON.parse(s!));
 expect(fresh.id).not.toBe(historical.id);expect(fresh.resumedFrom).toBe(historical.id);expect(fresh.state).toBe('Reviewing');expect(fresh.session.id).not.toBe(historical.session.id);expect(fresh.validation).toBeUndefined();expect(fresh.entries.every((e:any)=>e.decision==='Pending'&&!e.history.length)).toBe(true);
 expect(data.inputDigest).toBe(report.inputDigest);expect(data.policyDigest).toBe(report.policyDigest);expect(data.findings).toBe(report.findings.length);expect(data.filesAnalyzed).toBe(report.files.length);expect(data.uniqueAffectedFiles).toBe(report.metrics.uniqueAffectedFiles);expect(new URL(page.url()).searchParams.get('finding')).toBe(finding.id);
 await expect(page.locator('.summary > .card').filter({has:page.getByText('Total findings',{exact:true})}).locator('strong')).toHaveText(String(report.findings.length));await expect(page.locator('.workspace-card')).toContainText(report.files.length+' files analyzed');await expect(page.locator('button.file')).toHaveCount(report.metrics.uniqueAffectedFiles);
 const old=(await get('/review/workflows/'+historical.id)).workflow;expect(old.state).toBe('Rolled Back');expect(old.entries).toEqual(historical.entries);expect(old.validation).toEqual(historical.validation);expect(old.receipts).toEqual(applied.receipts);for(const receipt of old.receipts)expect(sha(readFileSync(receipt.backupPath,'utf8'))).toBe(receipt.originalSha256);
 await expect(page.getByRole('button',{name:'Approve fix',exact:true})).toBeEnabled();await expect(page.locator('.component-after iframe')).toHaveCount(1);await expect(page.locator('.component-after .preview-status')).toContainText('Candidate ready');
 expect(fresh.entries.filter((e:any)=>e.applied).map((e:any)=>e.finding.id)).toEqual([finding.id]);const rollbackIndex=events.findIndex(e=>e.url.endsWith('/rollback'));expect(events.slice(rollbackIndex+1).filter(e=>/\/(change|runtime|sessions|apply|validate)$/.test(e.url))).toHaveLength(0);
 expect(events.slice(rollbackIndex+1).filter(e=>e.url.endsWith('/prepare-preview'))).toHaveLength(1);
 if(process.env.RTL_ROLLBACK_DELIVERY){expect(events.filter(e=>e.url.endsWith('/rollback'))).toHaveLength(1);expect(events.filter(e=>e.url.endsWith('/apply'))).toHaveLength(1);expect(errors).toEqual([]);writeFileSync(info.outputPath('manual-delivery.json'),JSON.stringify({environment:env,dashboardUrl:page.url(),data,historical:old,fresh,events,errors,restoredSha:sha(original)},null,2));return;}
 await page.reload({waitUntil:'domcontentloaded'});await enterReview(page,mode);await expect(page.locator('.after-card pre')).toHaveText('<bdi dir="auto">{i.id}</bdi>');expect((await active()).id).toBe(fresh.id);await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});expect((await active()).session.id).toBe(fresh.session.id);
 await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(page.frameLocator('.component-after iframe').locator('.invoice-link > bdi[dir="auto"]').first()).toHaveText(/INV-/);await page.screenshot({path:info.outputPath('fresh-candidate.png'),fullPage:true});const prepared=await active();expect(prepared.session.id).not.toBe(historical.session.id);expect(prepared.entries.filter((e:any)=>e.applied)).toHaveLength(1);expect(prepared.entries.every((e:any)=>e.decision==='Pending')).toBe(true);expect(prepared.validation).toBeUndefined();
 expect(events.filter(e=>e.url.endsWith('/rollback'))).toHaveLength(1);expect(events.filter(e=>e.url.endsWith('/apply'))).toHaveLength(1);expect(readFileSync(join(env.project,source),'utf8')).toBe(original);expect(errors).toEqual([]);
 writeFileSync(info.outputPath('resumption-evidence.json'),JSON.stringify({mode,project:env.project,restoredSha:sha(original),data,historical:old,fresh,prepared,latePayload,events,errors},null,2));
});
