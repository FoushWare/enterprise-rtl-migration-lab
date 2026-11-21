// Black-box tarball verification: installed commands and browser UI only.
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:net';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
const wrapper=process.argv.includes('--wrapper'),scanEntry=wrapper?['rtl-analyzer','scan']:['rtl-scanner'],previewEntry=wrapper?['rtl-analyzer','preview']:['rtl-preview'];
const tarball=resolve(process.argv[2]||'');assert.ok(tarball.endsWith('.tgz'),'Pass the actual npm pack tarball');
const workspace=mkdtempSync(join(realpathSync(tmpdir()),'rtl-package-consumer-')),project=join(workspace,'project'),reports=join(workspace,'reports'),state=join(workspace,'state');
for(const p of [project,reports,state,join(project,'src'),join(project,'tests'),join(project,'public'),join(state,'backups')])mkdirSync(p,{recursive:true});
console.log('CONSUMER_WORKSPACE',workspace);
const evidence={workspace,tarball,tarballSha256:createHash('sha256').update(readFileSync(tarball)).digest('hex'),entry:wrapper?'rtl-analyzer (wrapper)':'rtl-scanner (implementation)',node:process.version,commands:[],modes:[]},save=()=>writeFileSync(join(workspace,'smoke.json'),JSON.stringify(evidence,null,2)+'\n');
const put=(p,v)=>writeFileSync(join(project,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
function run(command,args,expected=0){const r=spawnSync(command,args,{cwd:project,encoding:'utf8',timeout:300000}),log=`command-${evidence.commands.length}.log`;writeFileSync(join(workspace,log),(r.stdout||'')+(r.stderr||'')+(r.error?.message||''));evidence.commands.push({command,args,exit:r.status,log});save();assert.equal(r.status,expected,`${command} ${args.join(' ')}: ${r.stderr}`);return r.stdout;}
put('package.json',{name:'rtl-tarball-consumer',private:true,type:'module',scripts:{dev:'vite',typecheck:'tsc --noEmit',build:'vite build',test:'node --test tests/consumer.test.mjs'},dependencies:{react:'19.1.0','react-dom':'19.1.0'},devDependencies:{vite:'6.4.5',typescript:'~5.9.0','@types/react':'^19.1.0','@types/react-dom':'^19.1.0'}});
put('vite.config.ts',"import {defineConfig} from 'vite';export default defineConfig({});\n");
put('tsconfig.json',{compilerOptions:{target:'ES2022',module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,esModuleInterop:true},include:['src']});
put('index.html','<!doctype html><html dir="ltr"><head><title>Tarball consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
put('src/people.js',"export const people=[{id:'consumer-1',name:'Consumer / مستهلك'}];\n");put('src/people.d.ts','export const people:{id:string;name:string}[];\n');
put('src/main.tsx',`import React from 'react';import {createRoot} from 'react-dom/client';import {people} from './people.js';import './reading.css';const selectedDirection=()=>new URLSearchParams(location.search).get('direction')==='rtl'?'rtl':'ltr';document.documentElement.dir=selectedDirection();fetch('/state.json').then(r=>r.json()).then((state:{label:string})=>createRoot(document.getElementById('root')!).render(<main><h1>Installed package fixture</h1>{people.map(person=><article className="contact-card" data-id={person.id} key={person.id}><h2 className="contact-name">{person.name}</h2><span>{state.label}</span><p className="pending-me" dir="ltr">Pending source stays unchanged</p></article>)}</main>));\n`);
put('public/state.json',{label:'Ready'});
put('src/reading.css','body{font:16px system-ui}main{width:640px}article{width:400px;padding:16px}.contact-card{margin-left:18px}.contact-name{text-align:left}.pending-me{padding-right:11px}.unmapped{padding-left:6px}\n');
put('tests/consumer.test.mjs',"import {test} from 'node:test';import assert from 'node:assert/strict';import {people} from '../src/people.js';test('fixture has a stable target',()=>assert.equal(people[0].id,'consumer-1'));\n");
put('rtl-scanner.config.json',{schemaVersion:1,generatedStyleOwner:'unknown',ownership:{css:'custom-css'},approvals:[],exceptions:[],issueBindings:[],dynamicExceptions:[],roles:[]});
put('rtl-project.config.json',{schemaVersion:1,scanRoots:['src','index.html'],copyPaths:['src','index.html','tests','public','vite.config.ts','tsconfig.json','package.json','package-lock.json'],packageManager:'npm',validation:{typecheck:['run','typecheck'],build:['run','build'],test:['run','test']}});
put('rtl-preview.config.json',{schemaVersion:1,applications:{consumer:{viteConfig:'vite.config.ts',entry:'src/main.tsx',originalOrigin:'http://127.0.0.1:4215',readySelector:'#root main article',dataAdapter:'none',startupScript:'dev',routes:[{id:'people',path:'/people',ltr:'/people?direction=ltr',rtl:'/people?direction=rtl'}]}},mappings:[...['.contact-card','.contact-name','.pending-me'].map(selector=>({source:'src/reading.css',sourceSelector:selector,targetSelector:selector,routes:[{application:'consumer',route:'people'}]})),{source:'src/main.tsx',context:'module',targetSelector:'.contact-name',routes:[{application:'consumer',route:'people'}]}]});
let browser;const children=[];
try{
 run('npm',['install','--save-dev','--ignore-scripts','--no-audit','--no-fund',tarball]);
 assert.match(run('npx',['--no-install',...(wrapper?['rtl-analyzer']:scanEntry),'--help']),wrapper?/rtl-analyzer scan/:/Usage: rtl-scanner/);if(wrapper)evidence.version=run('npx',['--no-install','rtl-analyzer','--version']).trim();assert.match(run('npx',['--no-install',...previewEntry,'--help']),/Usage:.*rtl-preview/);run('npx',['--no-install',...previewEntry,'--unknown'],2);
 if(wrapper){
  const metadata=JSON.parse(readFileSync(join(project,'node_modules/rtl-analyzer/package.json'),'utf8'));
  evidence.implementation=metadata.rtlAnalyzerImplementation;
  evidence.installed=JSON.parse(run('npm',['ls','--depth=0','--json'])).dependencies;
  assert.match(run('npx',['--no-install','rtl-analyzer']),/<!doctype html>/);
  const defaultLog=readFileSync(join(workspace,`command-${evidence.commands.length-1}.log`),'utf8');
  evidence.defaultDashboard=defaultLog.match(/Dashboard: (.+)/)?.[1];assert.ok(evidence.defaultDashboard);assert.ok(readFileSync(evidence.defaultDashboard).length>1000);
  for(const format of ['markdown','markdown-structured'])assert.ok(run('npx',['--no-install',...scanEntry,'--root',project,'--format',format]).length>100);
 }
 const report=JSON.parse(run('npx',['--no-install',...scanEntry,'--root',project,'--format','json']));assert.equal(report.complete,true);assert.ok(report.diagnostics.some(d=>d.code==='RUNTIME_DIRECTION_UNKNOWN'&&!d.blocking));evidence.scan={files:report.files.length,findings:report.findings.length,diagnostics:report.diagnostics.length,complete:report.complete};
 run('npx',['--no-install',...scanEntry,'--root',project,'--format','json','--fail-on-findings'],1);
 run('npx',['--no-install',...scanEntry,'--root',project,'--format','dashboard','--embed-source-snippets','--output-dir',reports]);
 evidence.reports=['rtl-report.json','rtl-report.md','rtl-report-structured.md','rtl-report-dashboard.html'].map(path=>({path,bytes:readFileSync(join(reports,path)).length}));run('npx',['--no-install','playwright','install','chromium']);
 for(const port of [4215,4318,4320])await new Promise((yes,no)=>{const s=createServer();s.once('error',no);s.listen(port,'127.0.0.1',()=>s.close(yes))});
 const env={...process.env,RTL_PROJECT_ROOT:project,RTL_REVIEW_STORE_PATH:join(state,'review-records-v1.json'),RTL_EVIDENCE_STORE_PATH:join(state,'review-evidence-v1.json'),RTL_MANUAL_CHANGE_STORE_PATH:join(state,'manual-changes-v1.json'),RTL_SCAN_MANIFEST_STORE_PATH:join(state,'scan-manifests-v1.json'),RTL_AUDIT_STORE_PATH:join(state,'apply-audit-v1.json'),RTL_APPLY_BACKUP_ROOT:join(state,'backups')};
 children.push(spawn(join(project,'node_modules/.bin/'+previewEntry[0]),previewEntry.slice(1),{cwd:project,env,stdio:['ignore','pipe','pipe']}));children.push(spawn('python3',['-m','http.server','4320','--bind','127.0.0.1','--directory',reports],{cwd:workspace,stdio:['ignore','pipe','pipe']}));
 for(const [i,c] of children.entries())for(const stream of [c.stdout,c.stderr])stream.on('data',b=>writeFileSync(join(workspace,`service-${i}.log`),b,{flag:'a'}));
 for(const url of ['http://127.0.0.1:4318/health','http://127.0.0.1:4320/rtl-report-dashboard.html']){let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,url)}
 assert.equal((await fetch('http://127.0.0.1:4318/health').then(r=>r.json())).projectRoot,project);
 for(const path of ['/review/manual-changes','/review/rescan','/review/workflows'])for(const origin of ['http://untrusted.invalid',undefined]){
  const response=await fetch('http://127.0.0.1:4318'+path,{method:'POST',headers:{'content-type':'application/json',...(origin?{Origin:origin}:{})},body:'{malformed'});
  assert.equal(response.status,403);assert.equal((await response.json()).error,'ORIGIN_NOT_ALLOWED');
 }
 evidence.deniedWrites=6;
 const require=createRequire(join(project,'package.json')),{chromium,expect}=require('@playwright/test');browser=await chromium.launch({headless:true});
 const finding=report.findings.find(f=>f.context==='stylesheet/.contact-card');assert.ok(finding);const original=readFileSync(join(project,'src/reading.css'),'utf8');
 const hashes=()=>Object.fromEntries(report.files.map(p=>[p,createHash('sha256').update(readFileSync(join(project,p))).digest('hex')])),initialHashes=hashes();evidence.originalHashes=initialHashes;save();
 for(const mode of ['one-by-one','apply-first']){
  const context=await browser.newContext({viewport:{width:1600,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html?finding='+encodeURIComponent(finding.id));await page.getByRole('button',{name:mode==='one-by-one'?'Start manual review':'Prepare all & review',exact:true}).click();
  const before=page.locator('.component-before .embedded-state'),after=page.locator('.component-after .embedded-state');
  if(mode==='apply-first'){await expect(page.locator('.batch-review')).toBeVisible({timeout:60000});const marginRow=page.locator('.batch-review tbody tr').filter({hasText:'margin-left:18px'});await marginRow.getByRole('button',{name:'View diff',exact:true}).click();}
  await expect(before).toHaveAttribute('data-context-status','verified',{timeout:60000});await expect(after).toHaveAttribute('data-preparation-state','ready',{timeout:60000});
  const query=new URLSearchParams({mode,inputDigest:report.inputDigest,policyDigest:report.policyDigest}),snapshot=()=>fetch('http://127.0.0.1:4318/review/workflows?'+query).then(r=>r.json()).then(r=>r.workflow);let pending=await snapshot();assert.ok(pending.entries.every(e=>e.decision==='Pending'));assert.equal(pending.validation,undefined);assert.deepEqual(hashes(),initialHashes);
  if(mode==='one-by-one'){const prior=pending;await page.getByRole('button',{name:'Review actions',exact:true}).click();await page.getByRole('menuitem',{name:'Start new review',exact:true}).click();await expect(after).toHaveAttribute('data-preparation-state','ready',{timeout:60000});pending=await snapshot();assert.notEqual(pending.id,prior.id);await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByLabel('Historical review',{exact:true}).selectOption(prior.id);await expect(page.locator('.review-state-badge')).toHaveText('Superseded');await page.keyboard.press('Escape');}
  const result={mode,workflowId:pending.id,pendingPatches:pending.entries.filter(e=>e.applied).length};if(mode==='apply-first')assert.ok(pending.entries.filter(e=>e.patch).every(e=>e.applied));
  for(const dir of ['RTL','LTR']){await page.locator('.component-toolbar').getByRole('button',{name:dir,exact:true}).click();await expect(before).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(after).toHaveAttribute('data-context-status','verified',{timeout:30000});for(const role of ['before','after'])await expect(page.frameLocator(`.component-${role} iframe`).locator('html')).toHaveAttribute('dir',dir.toLowerCase());assert.equal(await page.frameLocator('.component-after iframe').locator('.contact-card').evaluate((n,p)=>getComputedStyle(n)[p],dir==='RTL'?'marginRight':'marginLeft'),'18px');}
  // A same-frame document reload must start a new evidence epoch; a message from the old document is stale.
  await page.evaluate(()=>{window.__testCandidateStatus=null;window.addEventListener('message',e=>{if(e.data?.type==='rtl-context-status'&&e.data.role==='candidate')window.__testCandidateStatus=e.data})});
  await expect.poll(()=>page.evaluate(()=>window.__testCandidateStatus?.nonce),{timeout:10000}).toBeTruthy();
  const oldStatus=await page.evaluate(()=>window.__testCandidateStatus);
  await page.frameLocator('.component-after iframe').locator('html').evaluate(()=>location.reload());
  await expect.poll(()=>page.evaluate(()=>window.__testCandidateStatus?.nonce),{timeout:30000}).not.toBe(oldStatus.nonce);
  await expect(after).toHaveAttribute('data-context-status','verified',{timeout:30000});
  await page.frameLocator('.component-after iframe').locator('html').evaluate((_,message)=>parent.postMessage({...message,dir:'rtl',directionRevision:999999},'http://127.0.0.1:4320'),oldStatus);
  await page.waitForTimeout(500);await expect(after).toHaveAttribute('data-context-status','verified');
  await page.getByRole('button',{name:'Approve proposed change',exact:true}).click();await page.getByRole('dialog',{name:'Proposed change approved'}).getByRole('button',{name:'Stay on this finding',exact:true}).click();if(mode==='apply-first'){await page.getByRole('button',{name:'Back to batch',exact:true}).click();await page.getByRole('button',{name:'Validate 1 approved changes',exact:true}).click()}else await page.getByRole('button',{name:'Validate changes',exact:true}).click();await expect(page.getByRole('dialog',{name:'Validation passed'})).toBeVisible({timeout:120000});const validated=await snapshot();assert.equal(validated.validation?.state,'Passed');assert.equal(validated.applyEligibility.eligible,true);assert.equal(validated.entries.filter(e=>e.applied).length,1);assert.deepEqual(hashes(),initialHashes);result.checks=validated.validationPresentation.checks.map(c=>({name:c.name,state:c.state}));assert.ok(result.checks.every(c=>c.state==='Passed'));
  // Unscanned application data changes the actual mapped target without modifying source or configuration.
  put('public/state.json',{label:'Changed after validation'});
  const stale=await fetch('http://127.0.0.1:4318/review/workflows/'+pending.id+'/apply',{method:'POST',headers:{'content-type':'application/json',Origin:'http://127.0.0.1:4320'},body:JSON.stringify({confirmation:'APPLY_CONFIRMED'})});
  assert.equal(stale.status,409);assert.match((await stale.json()).error,/DIRECTION_EVIDENCE_(TARGET_MISMATCH|STALE)/);assert.deepEqual(hashes(),initialHashes);
  put('public/state.json',{label:'Ready'});
  await page.getByRole('dialog',{name:'Validation passed'}).getByRole('button',{name:'Apply 1 changes…',exact:true}).click();const applyConfirmation=page.getByRole('dialog',{name:'Apply changes to source'});await expect(applyConfirmation).toContainText('1 accepted and validated changes');await applyConfirmation.getByRole('button',{name:'Apply to source',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied',{timeout:30000});assert.equal(readFileSync(join(project,'src/reading.css'),'utf8'),original.replace('margin-left:18px','margin-inline-start:18px'));const applied=await fetch('http://127.0.0.1:4318/review/workflows/'+pending.id).then(r=>r.json()).then(r=>r.workflow);assert.equal(applied.receipts.length,1);result.receipts=applied.receipts.length;result.appliedHashes=hashes();
  await page.getByRole('dialog',{name:'Changes applied'}).getByRole('button',{name:'View applied changes / operation details',exact:true}).click();await expect(page.getByRole('dialog',{name:'Session details'})).toBeVisible();await page.getByRole('button',{name:'History',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Historical results do not validate');await page.getByRole('tab',{name:'Technical',exact:true}).click();await expect(page.locator('.historical-context')).not.toContainText('undefined');await expect(page.locator('.historical-context')).toContainText('Current analysis ');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Review actions',exact:true}).click();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();
  await expect.poll(()=>readFileSync(join(project,'src/reading.css'),'utf8')).toBe(original);await expect(page.locator('.session-validation')).toContainText('Not run',{timeout:30000});await expect(before).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(after).toHaveAttribute('data-preparation-state','ready',{timeout:30000});const resumed=await snapshot();assert.notEqual(resumed.id,pending.id);assert.equal(resumed.resumedFrom,pending.id);assert.ok(resumed.entries.every(e=>e.decision==='Pending'));assert.equal(resumed.validation,undefined);assert.deepEqual(hashes(),initialHashes);assert.deepEqual(errors,[]);result.rollback='all scanned hashes restored; fresh Pending / Not run';result.rollbackHashes=hashes();await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByLabel('Historical review',{exact:true}).selectOption(pending.id);await expect(page.locator('.review-state-badge')).toHaveText('Rolled back');await page.keyboard.press('Escape');evidence.modes.push(result);save();await page.screenshot({path:join(workspace,mode+'-restored.png'),fullPage:true});await context.close();
 }
 // Bidi isolation is independent of inherited direction; it still requires approval and normal runtime validation.
 const bidi=report.findings.find(f=>f.ruleId==='RTL.BIDI.ISOLATION');assert.ok(bidi);
 const call=async(path,body)=>{const response=await fetch('http://127.0.0.1:4318/review/workflows'+path,{method:'POST',headers:{'content-type':'application/json',Origin:'http://127.0.0.1:4320'},body:JSON.stringify(body)});const result=await response.json();assert.ok(response.ok,JSON.stringify(result));return result.workflow};
 let independent=await call('',{mode:'one-by-one',scope:[],inputDigest:report.inputDigest,policyDigest:report.policyDigest,restart:true});
 assert.ok(independent.entries.find(e=>e.finding.id===bidi.id)?.patch,'independent patch remains available under uncertainty');
 independent=await call('/'+independent.id+'/change',{findingId:bidi.id,action:'apply'});independent=await call('/'+independent.id+'/change',{findingId:bidi.id,action:'Accepted'});
 independent=await call('/'+independent.id+'/validate',{});assert.equal(independent.validationPresentation.status,'Passed');assert.equal(independent.applyEligibility.eligible,true);
 independent=await call('/'+independent.id+'/apply',{confirmation:'APPLY_CONFIRMED'});assert.equal(independent.state,'Applied');assert.match(readFileSync(join(project,'src/main.tsx'),'utf8'),/<bdi dir="auto">\{person.name\}<\/bdi>/);
 independent=await call('/'+independent.id+'/rollback',{confirmation:'ROLLBACK_CONFIRMED'});assert.equal(independent.state,'Rolled Back');assert.deepEqual(hashes(),initialHashes);evidence.independent={findingId:bidi.id,result:'accepted, validated, applied and rolled back under unresolved runtime direction'};save();
 // A mapped LTR child in an RTL page is a valid local override, not a page-direction mismatch.
 const localFinding=report.findings.find(f=>f.context==='stylesheet/.pending-me');assert.ok(localFinding);
 await call('',{mode:'one-by-one',scope:[],inputDigest:report.inputDigest,policyDigest:report.policyDigest,restart:true});
 const localContext=await browser.newContext({viewport:{width:1600,height:1000}}),localPage=await localContext.newPage();
 await localPage.addInitScript(()=>{window.__localDirectionEvidence=[];addEventListener('message',e=>{if(e.data?.type==='rtl-context-status'&&e.data.role==='original')window.__localDirectionEvidence.push({page:e.data.dir,target:e.data.targets?.[0]?.effectiveDirection,status:e.data.targetStatus})})});
 await localPage.goto('http://127.0.0.1:4320/rtl-report-dashboard.html?finding='+encodeURIComponent(localFinding.id));await localPage.getByRole('button',{name:'Start manual review',exact:true}).click();
 await expect(localPage.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:60000});
 await expect(localPage.locator('.finding-heading')).toContainText('Review physical padding');
 await expect(localPage.locator('.details-summary-row')).toContainText('A visual defect is not established');
 await expect(localPage.locator('.details-summary-row')).toContainText('Confidence in static evidence: High');
 await localPage.locator('.more-details > summary').click();
 await expect(localPage.locator('.more-details-body')).toContainText('Confidence describes the static source match, not visual correctness');
 await expect(localPage.locator('.more-details-body')).toContainText('including local direction overrides');
 await expect(localPage.locator('.after-card h3')).toHaveText('After (Proposed Change)');
 await expect(localPage.locator('.after-card pre')).toHaveText('padding-inline-end:11px');
 await expect(localPage.getByRole('button',{name:'Approve proposed change',exact:true})).toBeVisible();
 await expect(localPage.locator('.workflow-decision')).toContainText('Pending');
 await localPage.locator('.component-toolbar').getByRole('button',{name:'RTL',exact:true}).click();
 await expect.poll(()=>localPage.evaluate(()=>window.__localDirectionEvidence.some(x=>x.page==='rtl'&&x.target==='ltr'&&x.status==='verified')),{timeout:30000}).toBe(true);
 await expect(localPage.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});
 // Inspect every matching element in both actual preview frames and both page directions.
 const localMeasurements=[];
 for(const direction of ['LTR','RTL']){
  await localPage.locator('.component-toolbar').getByRole('button',{name:direction,exact:true}).click();
  for(const role of ['before','after']){
   await expect(localPage.locator('.component-'+role+' .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});
   const frame=localPage.frameLocator('.component-'+role+' iframe');
   await expect(frame.locator('html')).toHaveAttribute('dir',direction.toLowerCase());
   const targets=await frame.locator('.pending-me').evaluateAll(nodes=>nodes.map(n=>({attribute:n.getAttribute('dir'),direction:getComputedStyle(n).direction,left:getComputedStyle(n).paddingLeft,right:getComputedStyle(n).paddingRight})));
   assert.deepEqual(targets,[{attribute:'ltr',direction:'ltr',left:'0px',right:'11px'}]);localMeasurements.push({page:direction,role,targets});
  }
 }
 // One selector can affect different local directions: the same logical candidate moves only RTL instances.
 const mixed=await localContext.newPage();
 for(const pageDirection of ['ltr','rtl']){
  const sample=async css=>{await mixed.setContent(`<html dir="${pageDirection}"><style>.shared{${css}}</style><p class="shared" dir="ltr">LTR</p><p class="shared" dir="rtl">RTL</p></html>`);return mixed.locator('.shared').evaluateAll(ns=>ns.map(n=>({direction:getComputedStyle(n).direction,left:getComputedStyle(n).paddingLeft,right:getComputedStyle(n).paddingRight})));};
  assert.deepEqual(await sample('padding-right:11px'),[{direction:'ltr',left:'0px',right:'11px'},{direction:'rtl',left:'0px',right:'11px'}]);
  assert.deepEqual(await sample('padding-inline-end:11px'),[{direction:'ltr',left:'0px',right:'11px'},{direction:'rtl',left:'11px',right:'0px'}]);
 }
 evidence.localOverride={findingId:localFinding.id,measurements:localMeasurements,mixedSelector:'RTL target changes sides; LTR target remains equivalent'};save();await localPage.screenshot({path:join(workspace,'local-override.png'),fullPage:true});await localContext.close();
 // Consecutive external-project selections must never inherit Atlas route or stale target state.
 const unmapped=report.findings.find(f=>f.context==='stylesheet/.unmapped'),initial=report.findings.find(f=>f.ruleId==='RTL.DOCUMENT.INITIAL'),dynamic=report.findings.find(f=>f.ruleId==='RTL.RUNTIME.DIRECTION_UNKNOWN');assert.ok(unmapped&&initial&&dynamic);
 const selectionContext=await browser.newContext({viewport:{width:1600,height:1000}}),selection=await selectionContext.newPage(),requests=[];
 selection.on('request',r=>requests.push(r.url()+(r.postData()||'')));
 const gotoFinding=async f=>{await selection.evaluate(id=>{history.pushState(null,'','?finding='+encodeURIComponent(id));dispatchEvent(new PopStateEvent('popstate'))},f.id);await expect(selection.locator('.finding-location')).toContainText(f.path,{timeout:30000});};
 await selection.goto('http://127.0.0.1:4320/rtl-report-dashboard.html?finding='+encodeURIComponent(finding.id));await expect(selection.locator('.finding-location')).toContainText(finding.path);await selection.getByRole('button',{name:'Start manual review',exact:true}).click();await expect(selection.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:60000});
 await gotoFinding(unmapped);await expect(selection.locator('.component-before .embedded-state')).toContainText('No configured source binding',{timeout:30000});await expect(selection.locator('.component-before .embedded-state')).toContainText('Add a binding for its source context and rendered target');await expect(selection.locator('.component-before .embedded-state')).toContainText('No built-in application mapping was used');assert.equal(await selection.locator('.component-review iframe').count(),0);
 await gotoFinding(initial);await expect(selection.locator('.direction-information')).toContainText('source fact, not a detected defect');await expect(selection.locator('.direction-preview-status')).toHaveText('No mapped preview for this finding.');assert.equal(await selection.locator('.component-review iframe, .decision-card, .code-diff-card').count(),0);
 await gotoFinding(dynamic);await expect(selection.locator('.direction-information')).toContainText('not inherently incorrect');await expect(selection.locator('.direction-information')).toContainText('not all application states');assert.equal(await selection.locator('.decision-card, .code-diff-card').count(),0);
 await selection.reload();await expect(selection.locator('.direction-information')).toContainText('not inherently incorrect');assert.equal(await selection.locator('.component-review iframe').count(),0);
 await gotoFinding(finding);await expect(selection.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:60000});await expect(selection.locator('.component-toolbar')).toContainText('/people');
 assert.ok(requests.every(x=>!x.includes('/invoices')&&!x.includes('InvoiceTable.tsx')),JSON.stringify(requests.filter(x=>x.includes('/invoices')||x.includes('InvoiceTable.tsx'))));
 evidence.selection={mapped:finding.id,unmapped:unmapped.id,initial:initial.id,dynamic:dynamic.id,result:'mapped, unmapped, initial and dynamic selections plus reload; no Atlas route/path'};await selection.screenshot({path:join(workspace,'selection-return-mapped.png'),fullPage:true});save();await selectionContext.close();
 evidence.status='Passed';save();console.log('CONSUMER_PASSED',JSON.stringify(evidence));
}catch(e){evidence.status='Failed';evidence.error=e.stack;save();throw e}
finally{await browser?.close();for(const c of children.reverse())if(c.exitCode===null&&c.signalCode===null){const done=new Promise(r=>c.once('exit',r));c.kill('SIGTERM');await done}}
