import {enterReview} from './enter-review';
import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const origin='http://127.0.0.1:4318';
test.describe.configure({mode:'serial'});
for(const mode of ['one-by-one','apply-first'] as const)test(mode+' prepares mixed directional families, measures real RTL, selectively applies and rolls back',async({page,request,browser},info)=>{
 test.setTimeout(240000);
 const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));if(!env.project.includes('rtl-analyzer-e2e-')||env.project.includes('EDczGl'))throw Error('DISPOSABLE_ONLY');
 const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
 const files=['odd-edges.css','another-random-name.css','StrangeProbe.tsx'];
 const findings=report.findings.filter((f:any)=>files.some(name=>f.path.endsWith(name)));
 const originals=Object.fromEntries([...new Set(findings.map((f:any)=>f.path))].map((p:any)=>[p,readFileSync(join(env.project,p),'utf8')]));
 const first=findings.find((f:any)=>f.original.startsWith('text-align: left'));expect(first).toBeTruthy();
 const snapshot=()=>request.get(origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode})).then(r=>r.json()).then(r=>r.workflow);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('?finding='+encodeURIComponent(first.id),{waitUntil:'domcontentloaded'});await enterReview(page,mode);await expect(page.locator('.workflow-summary')).toContainText(mode);
 let w=await snapshot();const workflowId=w.id;
 const entries=w.entries.filter((e:any)=>files.some(name=>e.finding.path.endsWith(name))&&e.patch);expect(entries).toHaveLength(13);
 expect(entries.every((e:any)=>e.decision==='Pending'&&e.reason.includes('Requires semantic review'))).toBe(true);
 expect(w.entries.filter((e:any)=>e.finding.path.endsWith('odd-edges.css')&&!e.patch).map((e:any)=>e.reason).join(' ')).toContain('CASCADE_DECLARATION');
 const utility=w.entries.find((e:any)=>e.finding.ruleId==='RTL.UTILITY.PHYSICAL');expect(utility.patch).toBeUndefined();expect(utility.reason).toContain('UTILITY_COMPILER_VERSION');
 async function select(f:any){await page.locator('button.file[data-source-path="'+f.path+'"]').click();await page.locator('button.finding').filter({hasText:f.path+':'+f.range.start.line+':'+f.range.start.column}).click()}
 for(const e of entries){await select(e.finding);await expect(page.locator('.before-card pre')).toHaveText(e.finding.original);await expect(page.locator('.after-card pre')).toHaveText(e.patch.replacement);if(mode==='one-by-one'){const mappedCss=e.finding.path.endsWith('.css');if(mappedCss)await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:20000});await page.getByRole('button',{name:mappedCss?'Apply & Preview':'Prepare candidate',exact:true}).click();await expect.poll(async()=>(await snapshot()).entries.find((a:any)=>a.finding.id===e.finding.id).applied).toBe(true)}}
 if(mode==='apply-first'){await select(first);await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:20000});await page.getByRole('button',{name:/Open candidate preview|Apply & Preview/,exact:true}).click()}
 await expect.poll(async()=>(await snapshot()).session.runtime?.status).toBe('healthy');w=await snapshot();
 for(const [path,source] of Object.entries(originals))expect(readFileSync(join(env.project,path),'utf8')).toBe(source);
 const app=await browser.newPage();
 async function metrics(base:string,rtl:boolean){await app.goto(base+'/invoices?demo=unmigrated-rtl&lang='+(rtl?'ar':'en'),{waitUntil:'domcontentloaded'});await expect(app.locator('html')).toHaveAttribute('dir',rtl?'rtl':'ltr');await expect(app.locator('#mixed-copy').first()).toBeVisible();return app.evaluate(()=>{
  const style=(s:string)=>getComputedStyle(document.querySelector(s)!);const a=style('.edge-align'),b=style('.edge-border'),i=style('#inline-style'),p=document.querySelector('#offset-parent')!.getBoundingClientRect(),o=document.querySelector('.edge-offset')!.getBoundingClientRect();
  return {align:a.textAlign,borderLeft:b.borderLeftWidth,borderRight:b.borderRightWidth,topLeft:b.borderTopLeftRadius,topRight:b.borderTopRightRadius,offsetLeft:o.left-p.left,offsetRight:p.right-o.right,icon:style('.edge-icon').scale,unmarked:style('.unmarked-icon').scale,inline:{left:i.marginLeft,right:i.marginRight,align:i.textAlign,bottomLeft:i.borderBottomLeftRadius,bottomRight:i.borderBottomRightRadius},text:document.querySelector('#mixed-copy')!.textContent,bdi:document.querySelector('#mixed-copy')!.querySelectorAll('bdi[dir="auto"]').length};
 })}
 const baseline=await metrics('http://127.0.0.1:4200',true);expect(baseline.align).toBe('left');expect(baseline.offsetLeft).toBe(12);expect(baseline.icon).toBe('none');expect(baseline.bdi).toBe(0);
 const renders:any[]=[];
 for(const rtl of [false,true]){const m=await metrics(w.session.runtime.origin,rtl);expect(m.align).toBe('start');expect(m[rtl?'borderRight':'borderLeft']).toBe('3px');expect(m[rtl?'topLeft':'topRight']).toBe('9px');expect(m[rtl?'offsetRight':'offsetLeft']).toBe(12);expect(m.icon).toBe(rtl?'-1 1':'none');expect(m.unmarked).toBe('none');expect(m.inline).toEqual(rtl?{left:'0px',right:'11px',align:'end',bottomLeft:'0px',bottomRight:'6px'}:{left:'11px',right:'0px',align:'end',bottomLeft:'6px',bottomRight:'0px'});expect(m.text).toBe(baseline.text);expect(m.bdi).toBe(3);renders.push({rtl,...m});await app.screenshot({path:info.outputPath(rtl?'candidate-rtl.png':'candidate-ltr.png'),fullPage:true})}
 // Rejection and deferral remove only their original-coordinate patch, preserving other family changes.
 const rejected=entries.find((e:any)=>e.finding.original==='marginLeft:11'),deferred=entries.find((e:any)=>e.finding.path.endsWith('another-random-name.css')&&e.finding.original.startsWith('text-align: right'));expect(rejected).toBeTruthy();expect(deferred).toBeTruthy();
 for(const e of entries){const label=e===rejected?'Reject fix':e===deferred?'Defer':'Approve fix';await select(e.finding);await page.getByRole('button',{name:label,exact:true}).click();await expect.poll(async()=>(await snapshot()).entries.find((a:any)=>a.finding.id===e.finding.id).decision).toBe(e===rejected?'Rejected':e===deferred?'Deferred':'Accepted')}
 w=await snapshot();expect(readFileSync(join(w.session.candidateRoot,rejected.finding.path),'utf8')).toContain('marginLeft:11');expect(readFileSync(join(w.session.candidateRoot,deferred.finding.path),'utf8')).toContain('text-align: right');
 await page.reload({waitUntil:'domcontentloaded'});await enterReview(page,mode);expect((await snapshot()).id).toBe(workflowId);
 await page.getByRole('button',{name:'Validate accepted changes',exact:true}).click();await expect(page.locator('.workflow-validation')).toContainText('Technical validation: Passed',{timeout:180000});await page.screenshot({path:info.outputPath('mixed-validated.png'),fullPage:true});
 await page.getByRole('button',{name:'Apply accepted changes to source',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied');w=await snapshot();expect(w.receipts).toHaveLength(3);
 const applied=await metrics('http://127.0.0.1:4200',true);expect(applied.borderRight).toBe('3px');expect(applied.inline.left).toBe('11px');expect(applied.inline.right).toBe('0px');expect(applied.icon).toBe('-1 1');expect(applied.bdi).toBe(3);
 // A supported route remains usable even while an unrelated shorthand has no transformation.
 const table=report.findings.find((f:any)=>f.path.endsWith('InvoiceTable.tsx')&&f.ruleId==='RTL.BIDI.ISOLATION');await select(table);await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30000});await page.getByRole('button',{name:'Expand original preview',exact:true}).click();await page.screenshot({path:info.outputPath('mixed-post-apply.png')});await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.reload({waitUntil:'domcontentloaded'});await enterReview(page,mode);await page.getByRole('button',{name:'Rollback accepted changes',exact:true}).click();await expect(page.locator('.source-context-status')).toContainText('Automatic rescan complete');
 const rolledBack=await metrics('http://127.0.0.1:4200',true);expect(rolledBack).toEqual(baseline);for(const [path,source] of Object.entries(originals))expect(readFileSync(join(env.project,path),'utf8')).toBe(source);await app.close();expect(errors).toEqual([]);
 writeFileSync(info.outputPath('mixed-family-acceptance.json'),JSON.stringify({mode,workflowId,baseline,renders,applied,rolledBack,entries:entries.map((e:any)=>({before:e.finding.original,after:e.patch.replacement,reason:e.reason})),receipts:w.receipts,errors},null,2));
});
