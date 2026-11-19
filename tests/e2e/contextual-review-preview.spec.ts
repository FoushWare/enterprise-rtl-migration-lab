import {enterReview} from './enter-review';
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const origin='http://127.0.0.1:4318';

test('every current example finding resolves a real contextual target in its running application',async({page,request},info)=>{
  test.setTimeout(900_000);page.setDefaultTimeout(12_000);
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));
  const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const errors:string[]=[],posts:string[]=[],coverage:any[]=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('request',r=>{if(r.url().startsWith(origin)&&r.method()==='POST')posts.push(r.url())});
  const first=report.findings.find((f:any)=>f.path.endsWith('/InvoiceTable.tsx')&&f.original==='{i.id}');
  await page.goto('?finding='+encodeURIComponent(first.id));await enterReview(page);
  await expect(page.locator('.session-identity')).toHaveAttribute('title','One by one review');
  const workflowUrl=origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'});const initialWorkflow=(await request.get(workflowUrl).then(r=>r.json())).workflow;
  let currentPath=first.path;
  const all=process.env.RTL_CONTEXT_FINDING_IDS?report.findings.filter((f:any)=>process.env.RTL_CONTEXT_FINDING_IDS!.split(',').includes(f.id)):process.env.RTL_CONTEXT_SMOKE?report.findings.filter((f:any)=>[first.id,'RTL.BIDI.ISOLATION:862b107afb21edf9840ac703','RTL.CSS.PHYSICAL:82212e990854fbb975d34448','RTL.BIDI.ISOLATION:6fdcd98e2ff091aff507968d'].includes(f.id)):report.findings;
  for(const f of all){
    expect(errors).toEqual([]);
    {
      const files=page.locator('button.file[data-source-path="'+f.path+'"]');
      if(f.path!==currentPath&&await files.count()){await files.click();currentPath=f.path;}
      await page.locator('button.finding').filter({hasText:f.path+':'+f.range.start.line+':'+f.range.start.column}).click();
    }
    const state=page.locator('.component-before .embedded-state');
    await expect(state, f.path+' '+f.original).toHaveAttribute('data-context-status',/verified|document/,{timeout:20_000});
    await expect(page.locator('iframe[title="Before: original application route"]')).toHaveAttribute('data-finding-id',f.id);
    const frame=page.frameLocator('iframe[title="Before: original application route"]');
    const highlighted=frame.locator('[data-rtl-context-overlay] .rtl-context-highlight');
    await expect(highlighted).not.toHaveCount(0);
    const mappingResponse=await request.get(origin+'/contextual-preview?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,findingId:f.id,mode:'ltr'}));
    expect(mappingResponse.ok()).toBe(true);const context=await mappingResponse.json();
    expect(context.mapping.kind).not.toBe('unresolved');expect(context.original.available).toBe(true);
    const targets=frame.locator(context.mapping.selector);expect(await targets.count()).toBeGreaterThan(0);
    const route=await frame.locator('body').evaluate(()=>location.pathname);
    const application=await frame.locator('body').evaluate(()=>location.port==='4201'?'procurement':'invoicing');
    expect(context.mapping.routes.some((r:any)=>r.application===application&&r.path===route)).toBe(true);
    const variants:any[]=[];
    for(const option of context.mapping.routes){
      if(option.id!==context.mapping.routes[0].id)await page.locator('.component-toolbar').getByLabel('Contextual route',{exact:true}).selectOption(option.id);
      await expect(async()=>{expect(await frame.locator('body').evaluate(()=>location.port+location.pathname)).toBe((option.application==='procurement'?'4201':'4200')+option.path)}).toPass({timeout:15_000});
      await expect(state).toHaveAttribute('data-context-status',/verified|document/,{timeout:20_000});
      await expect(page.locator('.component-toolbar > span')).toContainText(option.path);
      await expect(highlighted).not.toHaveCount(0);
      variants.push({application:option.application,route:option.path,requiredState:option.prepare||'default seeded page',targets:await targets.count(),renderedText:(await targets.allTextContents()).slice(0,3),status:await state.getAttribute('data-context-status'),computedValue:context.mapping.css?await targets.first().evaluate((node,property)=>getComputedStyle(node).getPropertyValue(property),context.mapping.css.property):null,renderedStatus:await state.textContent()});
    }
    const row={id:f.id,path:f.path,line:f.range.start.line,rule:f.ruleId,original:f.original,kind:context.mapping.kind,application,route,selector:context.mapping.selector,targets:await targets.count(),status:await state.getAttribute('data-context-status'),evidence:context.mapping.evidence,limitation:context.mapping.limitation||null,variants,renderedStatus:await state.textContent()};coverage.push(row);writeFileSync(info.outputPath('coverage.json'),JSON.stringify({root:env.project,inputDigest:report.inputDigest,total:report.findings.length,covered:coverage.length,coverage,posts,errors},null,2));
  }
  writeFileSync(info.outputPath('coverage.json'),JSON.stringify({root:env.project,inputDigest:report.inputDigest,total:report.findings.length,covered:coverage.length,coverage,posts,errors},null,2));
  expect((await request.get(workflowUrl).then(r=>r.json())).workflow).toEqual(initialWorkflow);
  expect(errors).toEqual([]);
  expect(posts.filter(url=>/\/change|\/runtime|\/sessions/.test(url))).toEqual([]);
});

async function expectExpanded(page:any,info:any){
  const workspace=page.locator('.component-review.embedded-expanded[role="dialog"]');
  await expect(workspace).toHaveAttribute('aria-modal','true');
  await expect(async()=>{
    const detail=await workspace.evaluate((node:any)=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return {box:{x:r.x,y:r.y,width:r.width,height:r.height},style:node.style.cssText,position:s.position,width:s.width,height:s.height,maxWidth:s.maxWidth,maxHeight:s.maxHeight,margin:s.margin,display:s.display,zoom:s.zoom,transform:s.transform,innerWidth,innerHeight,namespace:node.namespaceURI}});const native=detail.box;
    const browser=await workspace.boundingBox();
    writeFileSync(info.outputPath('expanded-geometry.json'),JSON.stringify({detail,native,browser},null,2));
    expect(native).toEqual({x:0,y:0,width:1600,height:1000});expect(browser).toEqual(native);
  }).toPass({timeout:15_000});
  await expect(page.locator('.component-before iframe')).toHaveCSS('transform','none');
  expect(await originalFrame(page).locator('body').evaluate(()=>innerWidth)).toBeGreaterThan(1500);
}

async function enter(page:any){
  page.setDefaultTimeout(12_000);
  const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));
  const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
  const first=report.findings.find((f:any)=>f.path.endsWith('/InvoiceTable.tsx')&&f.original==='{i.id}');
  await page.addInitScript(()=>{(window as any).__contextMessages=[];(window as any).__contextNavigations=[];window.addEventListener('message',e=>{if(e.data?.type==='rtl-context-status')(window as any).__contextMessages.push(e.data);if(e.data?.type==='rtl-context-navigation')(window as any).__contextNavigations.push(e.data)})});
  await page.goto('?finding='+encodeURIComponent(first.id));await enterReview(page);
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:25_000});
  return {env,report,first};
}
async function choose(page:any,report:any,id:string){
  const f=report.findings.find((f:any)=>f.id===id);expect(f,'finding exists').toBeTruthy();
  await page.locator('button.file[data-source-path="'+f.path+'"]').click();
  await page.locator('button.finding').filter({hasText:f.path+':'+f.range.start.line+':'+f.range.start.column}).click();
  await expect(page.locator('iframe[title="Before: original application route"]')).toHaveAttribute('data-finding-id',f.id);
  await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status',/verified|document/,{timeout:25_000});
  return f;
}
const originalFrame=(page:any)=>page.frameLocator('iframe[title="Before: original application route"]');
const candidateFrame=(page:any)=>page.frameLocator('iframe[title="After: isolated candidate application route"]');
const latest=(page:any,id:string,role='original')=>page.evaluate(({id,role}:any)=>(window as any).__contextMessages.filter((m:any)=>m.findingId===id&&m.role===role).at(-1),{id,role});

test('context controls verify cascade, instances, scrolling, shared app navigation and stale-message rejection',async({page,request},info)=>{
  test.setTimeout(180_000);
  const {report}=await enter(page);const posts:string[]=[];page.on('request',r=>{if(r.url().startsWith(origin)&&r.method()==='POST')posts.push(r.url())});
  const workflowUrl=origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'});
  const initial=(await request.get(workflowUrl).then(r=>r.json())).workflow;
  const chart='RTL.CSS.PHYSICAL:82212e990854fbb975d34448';await choose(page,report,chart);
  const frame=originalFrame(page),state=page.locator('.component-before .embedded-state');
  await expect(state).toContainText('contributing');
  expect((await latest(page,chart)).targets[0].css.computedValue).toBe('40px');
  await frame.locator('body').evaluate(()=>{const style=document.createElement('style');style.id='context-test-override';style.textContent='.chart-labels{padding-left:7px!important}';document.head.append(style)});
  await expect(state).toContainText('overridden');await expect(state).toContainText('computed 7px');
  await frame.locator('#context-test-override').evaluate((n:any)=>n.remove());await expect(state).toContainText('contributing');
  const cells='RTL.TABLE.ALIGNMENT:11f232d9438044cfba290f21';await choose(page,report,cells);
  const count=await frame.locator('tbody td').count();expect(count).toBeGreaterThan(6);
  const last=frame.locator('tbody td').last(),before=await last.evaluate((n:any)=>({html:n.outerHTML,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));
  await page.getByLabel('Original target instance',{exact:true}).selectOption(String(count-1));
  await expect(frame.locator('.rtl-context-highlight')).toHaveAttribute('data-target-index',String(count-1));
  expect(await last.evaluate((n:any)=>({html:n.outerHTML,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}))).toEqual(before);
  await expect.poll(()=>last.evaluate((n:any)=>{const r=n.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight})).toBe(true);
  await page.getByLabel('Original target instance',{exact:true}).selectOption('-1');await expect(frame.locator('.rtl-context-highlight')).toHaveCount(count);
  const geometry=report.findings.find((f:any)=>f.ruleId==='RTL.GEOMETRY.ORDER'&&f.original.includes('translateX(-100%)'));await choose(page,report,geometry.id);
  await expect(state).toContainText('contributing');
  await page.getByRole('button',{name:'Reveal navigation',exact:true}).click();await expect(frame.locator('aside')).toHaveClass(/is-open/);await expect(state).toContainText('overridden');
  await page.getByRole('button',{name:'Expand original preview',exact:true}).click();await page.getByRole('dialog').getByLabel('Preview viewport',{exact:true}).selectOption('0');await expect(state).toContainText('inactive');await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
  const shared='RTL.FORM.DIRECTION:c3038155faae0e23f50372db';await choose(page,report,shared);
  await frame.locator('.app-link').click();await expect.poll(()=>frame.locator('body').evaluate(()=>location.port)).toBe('4201');await expect(state).toHaveAttribute('data-context-status','verified');
  await expect(page.locator('.component-toolbar').getByLabel('Contextual route',{exact:true})).toHaveValue('procurement:/');
  await frame.locator('.app-link').click();await expect.poll(()=>frame.locator('body').evaluate(()=>location.port)).toBe('4200');await expect(state).toHaveAttribute('data-context-status','verified');
  await frame.getByLabel('Language / اللغة',{exact:true}).selectOption('ar');await expect(frame.locator('html')).toHaveAttribute('dir','rtl');await expect(state).toHaveAttribute('data-context-status','navigated');await page.locator('.component-toolbar').getByRole('button',{name:'LTR',exact:true}).click();await expect(frame.locator('html')).toHaveAttribute('dir','ltr');await expect(state).toHaveAttribute('data-context-status','verified');
  // Forged attribution sent from the real frame still fails the full identity checks.
  const valid=await latest(page,shared);await frame.locator('body').evaluate((_:any,p:any)=>{for(const altered of [{nonce:'stale'},{sessionId:'wrong'},{application:'procurement'},{findingId:'wrong'},{sourceSha256:'0'.repeat(64)},{routeId:'procurement:/'}])parent.postMessage({...p,...altered,targets:[],targetStatus:'unresolved'},'http://127.0.0.1:4320')},valid);
  await page.waitForTimeout(350);await expect(state).toHaveAttribute('data-context-status','verified');expect(posts).toEqual([]);expect((await request.get(workflowUrl).then(r=>r.json())).workflow).toEqual(initial);
  writeFileSync(info.outputPath('controls.json'),JSON.stringify({cssOverrideVerified:true,mediaVerified:true,instances:count,layoutPreserved:true,scrolled:true,sharedAppLinks:true,staleMessagesRejected:true,inAppDirectionRestored:true,posts},null,2));
});

test('expanded contexts stay readable after a long sequence of finding changes',async({page},info)=>{
  test.setTimeout(600_000);const {report,first}=await enter(page);const initialStyles=await page.locator('head > style').count();let currentPath=first.path;
  for(const f of report.findings){if(f.path!==currentPath){await page.locator('button.file[data-source-path="'+f.path+'"]').click();currentPath=f.path}await page.locator('button.finding').filter({hasText:f.path+':'+f.range.start.line+':'+f.range.start.column}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status',/verified|document/,{timeout:25_000});await expect(page.locator('.component-before iframe')).toHaveAttribute('data-finding-id',f.id)}
  await expect(page.locator('head > style')).toHaveCount(initialStyles);
  writeFileSync(info.outputPath('context-switching.json'),JSON.stringify({findingsVisited:report.findings.length,initialStyles,finalStyles:await page.locator('head > style').count(),stylesheetCountStable:true},null,2));
  for(const id of ['RTL.BIDI.ISOLATION:6fdcd98e2ff091aff507968d','RTL.BIDI.ISOLATION:862b107afb21edf9840ac703','RTL.CSS.PHYSICAL:82212e990854fbb975d34448']){
    const f=await choose(page,report,id);await page.getByRole('button',{name:'Expand original preview',exact:true}).click();await expectExpanded(page,info);await expect.poll(()=>originalFrame(page).locator('.rtl-context-highlight').first().evaluate((n:any)=>!n.textContent?.includes('outside the viewport'))).toBe(true);await page.screenshot({path:info.outputPath(id.split(':')[0]+'-'+(f.path.includes('procurement')?'procurement':'invoicing')+'.png')});await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
  }
});

test('actual candidates use scoped equivalent data across origins and preserve review state through failures',async({page,request},info)=>{
  test.setTimeout(240_000);
  await page.addInitScript(()=>{if(['4200','4201'].includes(location.port)){localStorage.setItem('atlas-invoices-v1','Ahmed ordinary data canary');localStorage.setItem('ordinary-canary','preserve me')}});
  const {env,report,first}=await enter(page);
  const {createHash}=await import('node:crypto');
  const sourceHashes=()=>Object.fromEntries(report.files.map((p:string)=>[p,createHash('sha256').update(readFileSync(join(env.project,p))).digest('hex')]));const sources=sourceHashes();
  const url=origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'});
  const snapshot=async()=>(await request.get(url).then(r=>r.json())).workflow;
  const initial=await snapshot();
  const {createServer}=await import('node:http');const blocker=createServer((_,res)=>res.end('unrelated-port-owner'));
  let owned=false;await new Promise<void>((resolve,reject)=>{blocker.once('error',(e:any)=>e.code==='EADDRINUSE'?resolve():reject(e));blocker.listen(4202,'127.0.0.1',()=>{owned=true;resolve()})});
  try{
    await page.getByRole('button',{name:initial.entries.find((e:any)=>e.finding.id===first.id).applied?'Open candidate application':'Apply & Preview',exact:true}).click();
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
    const before=originalFrame(page),after=candidateFrame(page),invoiceSession=(await snapshot()).session;
    if(owned){expect(invoiceSession.runtime.port).not.toBe(4202);expect(await request.get('http://127.0.0.1:4202').then(r=>r.text())).toBe('unrelated-port-owner')}
    await expect(before.locator('.invoice-link > bdi')).toHaveCount(0);await expect(after.locator('.invoice-link > bdi')).toHaveCount(8);
    await expect.poll(async()=>(await latest(page,first.id))?.dataFingerprint===(await latest(page,first.id,'candidate'))?.dataFingerprint).toBe(true);
    const data=async(frame:any)=>frame.locator('body').evaluate(()=>({key:(window as any).__rtlPreviewStorageKey,rows:JSON.parse(localStorage.getItem((window as any).__rtlPreviewStorageKey)!),ordinary:localStorage.getItem('atlas-invoices-v1'),canary:localStorage.getItem('ordinary-canary')}));
    const seeded=await data(before);expect(seeded.rows).toHaveLength(24);expect(seeded.ordinary).toBe('Ahmed ordinary data canary');expect(seeded.canary).toBe('preserve me');expect((await data(after)).rows).toEqual(seeded.rows);
    await page.getByRole('button',{name:'Expand original preview',exact:true}).click();expect(await page.getByRole('dialog',{name:'Live application preview'}).boundingBox()).toEqual({x:0,y:0,width:1600,height:1000});
    await before.locator('.app-link').click();await expect.poll(()=>page.evaluate(()=>(window as any).__contextNavigations.at(-1)?.sessionId)).toBe(invoiceSession.id);expect(await before.locator('body').evaluate(()=>location.port)).toBe('4200');
    // Create through the real form; only the dedicated preview data changes.
    await before.getByRole('link',{name:'Create invoice',exact:true}).first().click();
    await before.locator('.form-grid [role="combobox"]').first().click();await before.getByRole('option').first().click();
    await before.getByRole('textbox',{name:'Description 1',exact:true}).fill('Contextual data isolation test');await before.getByRole('spinbutton',{name:'Rate 1',exact:true}).fill('125');
    await before.getByRole('button',{name:'Review invoice',exact:true}).click();await before.getByRole('dialog').getByRole('button',{name:'Create invoice',exact:true}).click();
    await expect(before.getByRole('dialog')).toHaveCount(0);await expect.poll(()=>before.locator('body').evaluate(()=>location.pathname)).toMatch(/^\/invoices\/INV-/);
    await expect.poll(async()=>(await data(before)).rows.length).toBe(25);
    await page.getByRole('dialog',{name:'Live application preview'}).getByRole('button',{name:'Close',exact:true}).click();
    const customer=report.findings.find((f:any)=>f.path.endsWith('/Customers.tsx')&&f.original==='{c.name}');await choose(page,report,customer.id);expect((await data(before)).rows).toHaveLength(25);await choose(page,report,first.id);expect((await data(before)).rows).toHaveLength(25);await page.getByRole('button',{name:'Expand original preview',exact:true}).click();
    await expect(page.locator('.preview-context-summary')).toContainText('datasets differ');
    await page.getByRole('dialog').getByRole('button',{name:'Reset preview data',exact:true}).click();
    await expect(async()=>{expect((await data(before)).rows).toHaveLength(24);expect((await data(after)).rows).toHaveLength(24)}).toPass({timeout:15_000});await expect(page.locator('.preview-context-summary')).toContainText('Equivalent preview data');expect((await data(before)).ordinary).toBe('Ahmed ordinary data canary');expect((await data(before)).canary).toBe('preserve me');
    await page.getByRole('dialog').getByRole('button',{name:'Before',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready');await page.screenshot({path:info.outputPath('before-only.png')});
    await page.getByRole('dialog').getByRole('button',{name:'After',exact:true}).click();await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready');await page.screenshot({path:info.outputPath('after-only.png')});
    await page.getByRole('dialog').getByRole('button',{name:'Split',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Highlight targets',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-state','ready');await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready');await page.screenshot({path:info.outputPath('split.png')});
    await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
    const order=report.findings.find((f:any)=>f.path==='apps/procurement/src/App.tsx'&&f.original==='{o.id}');await choose(page,report,order.id);await page.getByRole('button',{name:'Apply & Preview',exact:true}).click();
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
    await expect(after.locator('.invoice-link > bdi')).toHaveCount(9);await expect(before.locator('.invoice-link > bdi')).toHaveCount(0);expect((await snapshot()).session.id).toBe(invoiceSession.id);
    expect(await after.locator('body').evaluate(()=>location.port)).not.toBe(String(invoiceSession.runtime.port));
    await page.getByRole('button',{name:'Expand candidate preview',exact:true}).click();await page.screenshot({path:info.outputPath('procurement-candidate.png')});await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
    const orderDetail=report.findings.find((f:any)=>f.path==='apps/procurement/src/App.tsx'&&f.original==='{order.id}');await choose(page,report,orderDetail.id);await page.getByRole('button',{name:'Apply & Preview',exact:true}).click();
    await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});await expect(before.locator('.page-heading h1 > bdi')).toHaveCount(0);await expect(after.locator('.page-heading h1 > bdi')).toHaveCount(1);expect((await snapshot()).session.id).toBe(invoiceSession.id);
    const stable=await snapshot(),posts:string[]=[];page.on('request',r=>{if(r.url().startsWith(origin)&&r.method()==='POST')posts.push(r.url())});
    for(let i=0;i<3;i++){await page.getByRole('button',{name:'Expand',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'After',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Highlight targets',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click()}
    expect(posts).toEqual([]);expect(await snapshot()).toEqual(stable);const presentationPosts=[...posts];
    const amount=report.findings.find((f:any)=>f.path==='apps/procurement/src/App.tsx'&&f.context==='Orders'&&f.original.includes('money('));await choose(page,report,amount.id);await expect(page.locator('.component-helper')).toContainText('No automatic fix');await expect(page.getByRole('button',{name:'Apply & Preview',exact:true})).toHaveCount(0);await expect(page.locator('.component-after .embedded-state')).toContainText('selected finding unchanged');
    await page.route('**/contextual-preview?**',route=>route.abort());await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','unavailable');await page.unroute('**/contextual-preview?**');await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified');
    const identity=await request.get('http://127.0.0.1:4201/__rtl_preview_identity').then(r=>r.json());expect(identity.projectRoot).toBe(env.project);
    // Pause only the original child owned by this disposable harness, then recover it.
    process.kill(env.children[2],'SIGSTOP');
    try{await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','runtime-unavailable',{timeout:10_000});await expect(page.locator('.component-before .embedded-state')).toContainText('Runtime unavailable')}finally{process.kill(env.children[2],'SIGCONT')}
    await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified');
    process.kill(env.supervisorPid,'SIGUSR1');
    await expect.poll(async()=>{try{return (await request.get(origin+'/health',{timeout:1000})).ok()}catch{return false}}).toBe(false);
    await page.getByRole('button',{name:'Retry context',exact:true}).click();await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','unavailable');
    process.kill(env.supervisorPid,'SIGUSR2');await expect.poll(async()=>{try{return (await request.get(origin+'/health',{timeout:1000})).ok()}catch{return false}},{timeout:15_000}).toBe(true);
    await page.reload({waitUntil:'domcontentloaded'});await enterReview(page);await expect(page.locator('.session-identity')).toHaveAttribute('title','One by one review');expect((await snapshot()).id).toBe(stable.id);expect((await snapshot()).session.id).toBe(invoiceSession.id);
    await expect(page.locator('.component-toolbar .context-preview-controls')).toHaveCount(1);
    await page.getByRole('button',{name:'Open candidate application',exact:true}).click();await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-state','ready',{timeout:30_000});
    expect((await snapshot()).entries.map((e:any)=>({id:e.finding.id,applied:e.applied,decision:e.decision}))).toEqual(stable.entries.map((e:any)=>({id:e.finding.id,applied:e.applied,decision:e.decision})));
    expect(sourceHashes()).toEqual(sources);expect((await snapshot()).entries.map((e:any)=>e.decision)).toEqual(initial.entries.map((e:any)=>e.decision));
    writeFileSync(info.outputPath('candidate-data.json'),JSON.stringify({workflowId:stable.id,sessionId:invoiceSession.id,sourceHashes:sources,sourcePreserved:true,initialRows:24,interactionRows:25,resetRows:24,noReseedOnFindingSelection:true,ordinaryStoragePreserved:true,scopedKey:seeded.key,originalBdi:0,invoiceCandidateBdi:8,procurementCandidateBdi:9,procurementDetailCandidateBdi:1,distinctAppOrigins:true,reusedOriginalFrameSessionBinding:true,occupiedPortPreserved:owned,runtimeOutageRecovered:true,companionRestartRecovered:true,presentationPosts,subsequentExplicitRequests:posts,patches:stable.entries.filter((e:any)=>e.applied).map((e:any)=>({id:e.finding.id,path:e.finding.path,decision:e.decision})),validation:stable.validation?.state||'Not run'},null,2));
  }finally{if(owned)await new Promise<void>(resolve=>blocker.close(()=>resolve()))}
});


