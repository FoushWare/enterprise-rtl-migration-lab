import {test,expect} from '@playwright/test';
import {enterReview} from './enter-review';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

test('historical diagnostic captures selector, rollback banner and verbose Decision defects',async({page,request},info)=>{
 test.skip(process.env.RTL_PREVIEW_UI_REPRO!=='1','Pre-fix diagnostic, not the current UI contract.');
 const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));if(!env.project.includes('rtl-independent-onboarding-'))throw Error('DISPOSABLE_ONLY');
 const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8')),f=report.findings.find((f:any)=>f.context==='stylesheet/.contact-card');
 const current=()=>request.get('http://127.0.0.1:4318/review/workflows?'+new URLSearchParams({mode:'one-by-one',inputDigest:report.inputDigest,policyDigest:report.policyDigest})).then(r=>r.json()).then(r=>r.workflow);
 const ready=async()=>{await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});};
 const targets=()=>page.getByLabel('Candidate target instance',{exact:true}).evaluate((n:HTMLSelectElement)=>({value:n.value,options:[...n.options].map(o=>({value:o.value,label:o.label}))}));
 await request.post('http://127.0.0.1:4318/review/workflows',{headers:{Origin:'http://127.0.0.1:4320'},data:{mode:'one-by-one',inputDigest:report.inputDigest,policyDigest:report.policyDigest,scope:[],restart:true}});
 page.on('dialog',d=>d.accept());await page.goto('?finding='+encodeURIComponent(f.id));await enterReview(page);await ready();const initial=await targets();
 await page.getByLabel('Candidate target instance',{exact:true}).selectOption('-1');await page.getByRole('button',{name:'Approve fix',exact:true}).click();await expect(page.locator('.workflow-decision')).toContainText('Accepted');await page.waitForTimeout(1200);await ready();const approved=await targets();await page.screenshot({path:info.outputPath('before-fix-approved-selector.png'),fullPage:true});
 await page.getByRole('button',{name:/^Validate \d+ accepted changes$/}).click();await expect(page.locator('.workflow-validation')).toContainText('Passed',{timeout:30000});const validated=await current();
 await page.getByRole('button',{name:/^Apply \d+ accepted changes to source$/}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied');await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30000});const appliedDecision=await page.locator('.decision-card').innerText();await page.screenshot({path:info.outputPath('before-fix-after-apply.png'),fullPage:true});
 await page.locator('.session-overflow > summary').click();await page.getByRole('menuitem',{name:'Rollback accepted changes',exact:true}).click();await ready();await expect(page.locator('.workflow-validation')).toContainText('Not run');
 await page.getByRole('button',{name:'Approve fix',exact:true}).click();await page.getByRole('button',{name:/^Validate \d+ accepted changes$/}).click();await expect(page.locator('.workflow-validation')).toContainText('Passed',{timeout:30000});const advancedDecision=await page.locator('.decision-card').innerText();await page.screenshot({path:info.outputPath('before-fix-stale-rollback-status.png'),fullPage:true});
 writeFileSync(info.outputPath('reproduction.json'),JSON.stringify({initial,approved,appliedDecision,advancedDecision,validated,current:await current()},null,2));
 expect(approved.options.some(o=>o.label==='No target yet')).toBe(true);expect(appliedDecision).toContain(validated.inputDigest);expect(advancedDecision).toContain('Rollback succeeded');expect(advancedDecision).toContain('Passed');
 writeFileSync(info.outputPath('reproduction.json'),JSON.stringify({initial,approved,appliedDecision,advancedDecision,validated,current:await current()},null,2));
});
