// Black-box tarball verification: installed commands and browser UI only.
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readdirSync,readFileSync,realpathSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:net';
import {tmpdir,userInfo} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {toolInvocation,binaryInvocation} from './tool-invocation.mjs';
import {pathToFileURL} from 'node:url';
const wrapper=process.argv.includes('--wrapper'),scanEntry=wrapper?['rtl-analyzer','scan']:['rtl-scanner'],previewEntry=wrapper?['rtl-analyzer','preview']:['rtl-preview'];
const tarball=resolve(process.argv[2]||'');assert.ok(tarball.endsWith('.tgz'),'Pass the actual npm pack tarball');
const smokeStartedAt=Date.now();
// Removes this run's temporary workspace and the dashboard folders that the packaged CLI created during the run. Folders older than
// the run belong to someone else and are never touched.
function disposeSmokeTemporaries(since){rmSync(workspace,{recursive:true,force:true});const temp=realpathSync(tmpdir());for(const name of readdirSync(temp)){if(!name.startsWith('rtl-analyzer-dashboard-'))continue;const path=join(temp,name);try{if(statSync(path).mtimeMs>=since-1000)rmSync(path,{recursive:true,force:true})}catch{}}}
const workspace=mkdtempSync(join(realpathSync(tmpdir()),'rtl-package-consumer-')),project=join(workspace,'project'),reports=join(workspace,'reports'),state=join(workspace,'state');
for(const p of [project,reports,state,join(project,'src'),join(project,'tests'),join(project,'public'),join(state,'backups')])mkdirSync(p,{recursive:true});
console.log('CONSUMER_WORKSPACE',workspace);
const configuredProposal=process.env.RTL_SMOKE_CONFIGURED_PROPOSAL==='1';
const proposal=configuredProposal?{before:'border-left:4px solid #279',after:'border-inline-start:4px solid #279',ltr:'borderLeftWidth',rtl:'borderRightWidth',width:'4px'}:{before:'margin-left:18px',after:'margin-inline-start:18px',ltr:'marginLeft',rtl:'marginRight',width:'18px'};
const evidence={workspace,tarball,tarballSha256:createHash('sha256').update(readFileSync(tarball)).digest('hex'),entry:wrapper?'rtl-analyzer (wrapper)':'rtl-scanner (implementation)',node:process.version,commands:[],modes:[]},save=()=>writeFileSync(join(workspace,'smoke.json'),JSON.stringify(evidence,null,2)+'\n');
const put=(p,v)=>writeFileSync(join(project,p),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
function run(command,args,expected=0){const invocation=toolInvocation(command,args),r=spawnSync(invocation.file,invocation.args,{cwd:project,encoding:'utf8',timeout:300000}),log=`command-${evidence.commands.length}.log`;writeFileSync(join(workspace,log),(r.stdout||'')+(r.stderr||'')+(r.error?.message||''));evidence.commands.push({command,args,exit:r.status,log});save();assert.equal(r.status,expected,`${command} ${args.join(' ')}: ${r.stderr||''}${r.error?` [spawn error ${r.error.code??''}: ${r.error.message}]`:''}`);return r.stdout;}
put('package.json',{name:'rtl-tarball-consumer',private:true,type:'module',scripts:{dev:'vite',typecheck:'tsc --noEmit',build:'vite build',test:'node --test tests/consumer.test.mjs'},dependencies:{react:'19.1.0','react-dom':'19.1.0'},devDependencies:{vite:'6.4.5',typescript:'~5.9.0','@types/react':'^19.1.0','@types/react-dom':'^19.1.0'}});
put('vite.config.ts',"import {defineConfig} from 'vite';export default defineConfig({});\n");
put('tsconfig.json',{compilerOptions:{target:'ES2022',module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,esModuleInterop:true},include:['src']});
put('index.html','<!doctype html><html dir="ltr"><head><title>Tarball consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
put('src/people.js',"export const people=[{id:'consumer-1',name:'Consumer / مستهلك'}];\n");put('src/people.d.ts','export const people:{id:string;name:string}[];\n');
put('src/main.tsx',`import React from 'react';import {createRoot} from 'react-dom/client';import {people} from './people.js';import './reading.css';const selectedDirection=()=>new URLSearchParams(location.search).get('direction')==='rtl'?'rtl':'ltr';document.documentElement.dir=selectedDirection();fetch('/state.json').then(r=>r.json()).then((state:{label:string})=>createRoot(document.getElementById('root')!).render(<main><h1>Installed package fixture</h1>{people.map(person=><article className="contact-card" data-id={person.id} key={person.id}><h2 className="contact-name">{person.name}</h2><span>{state.label}</span><p className="pending-me" dir="ltr">Pending source stays unchanged</p></article>)}</main>));\n`);
put('public/state.json',{label:'Ready'});
const css='body{font:16px system-ui}main{width:640px}article{width:400px;padding:16px}.contact-card{'+proposal.before+'}.contact-name{text-align:left}.pending-me{padding-right:11px}.unmapped{padding-left:6px}\n';
put('src/reading.css',css);
put('tests/consumer.test.mjs',"import {test} from 'node:test';import assert from 'node:assert/strict';import {people} from '../src/people.js';test('fixture has a stable target',()=>assert.equal(people[0].id,'consumer-1'));\n");
put('rtl-scanner.config.json',{schemaVersion:1,generatedStyleOwner:'unknown',ownership:{css:'custom-css'},approvals:[],exceptions:[],issueBindings:[],dynamicExceptions:[],roles:[],...(configuredProposal?{cssProposals:[{path:'src/reading.css',context:'stylesheet/.contact-card',property:'border-left',value:'4px solid #279',kind:'inline-edge',sourceDigest:createHash('sha256').update(css).digest('hex')}]}:{})});
put('rtl-project.config.json',{schemaVersion:1,scanRoots:['src','index.html'],copyPaths:['src','index.html','tests','public','vite.config.ts','tsconfig.json','package.json','package-lock.json'],packageManager:'npm',validation:{typecheck:['run','typecheck'],build:['run','build'],test:['run','test']}});
put('rtl-preview.config.json',{schemaVersion:1,applications:{consumer:{viteConfig:'vite.config.ts',entry:'src/main.tsx',originalOrigin:'http://127.0.0.1:4215',readySelector:'#root main article',dataAdapter:'none',startupScript:'dev',routes:[{id:'people',path:'/people',ltr:'/people?direction=ltr',rtl:'/people?direction=rtl'}]}},mappings:[...['.contact-card','.contact-name','.pending-me','.unmapped'].map(selector=>({source:'src/reading.css',sourceSelector:selector,targetSelector:selector,routes:[{application:'consumer',route:'people'}]})),{source:'src/main.tsx',context:'module',targetSelector:'.contact-name',routes:[{application:'consumer',route:'people'}]}]});
// Runs a command that the v0.5.0 Windows contract must refuse: exit code 2 is required and the combined output is returned.
function refused(args){const invocation=toolInvocation('npx',args),r=spawnSync(invocation.file,invocation.args,{cwd:project,encoding:'utf8',timeout:300000}),log=`command-${evidence.commands.length}.log`,output=(r.stdout||'')+(r.stderr||'');writeFileSync(join(workspace,log),output+(r.error?.message||''));evidence.commands.push({command:'npx',args,exit:r.status,log});save();assert.equal(r.status,2,`npx ${args.join(' ')}: expected refusal with exit 2; ${r.stderr||''}${r.error?` [spawn error ${r.error.code??''}: ${r.error.message}]`:''}`);return output;}
// Windows v0.5.0 contract: dashboard/report publication is refused with the documented platform error and exit code 2, nothing
// partial is created, and an existing report file is not overwritten. The full consumer workflow runs on Ubuntu.
function verifyWindowsUnsupportedPublication(){
  const reports=join(workspace,'contract-reports'),previous='previous report\n';
  mkdirSync(reports,{recursive:true});writeFileSync(join(reports,'rtl-report.json'),previous);
  const dashboard=refused(['--no-install',...scanEntry,'--root',project,'--format','dashboard','--output-dir',reports]);
  assert.match(dashboard,/unsupported platform\/filesystem profile/);
  assert.deepEqual(readdirSync(reports).sort(),['rtl-report.json'],'publication must not create partial or unexpected artifacts');
  assert.equal(readFileSync(join(reports,'rtl-report.json'),'utf8'),previous,'an existing report must not be overwritten');
  const oneCommand=refused(['--no-install','rtl-analyzer']);
  assert.match(oneCommand,/Dashboard was not generated/);
  evidence.status='Passed';evidence.windowsContract={platform:'win32',publication:'refused',exitCode:2,error:'unsupported platform/filesystem profile',existingFileUnchanged:true,artifacts:['rtl-report.json']};save();
  console.log('CONSUMER_PASSED',JSON.stringify(evidence));
}
let browser;const children=[];let staticReports;
async function startDashboardSession(project,directory){const dist=pathToFileURL(join(project,'node_modules/rtl-analyzer/dist')).href;const {DashboardSession}=await import(dist+'/dashboard-session.js');const {readCompanionBootstrap}=await import(dist+'/companion-auth.js');const session=new DashboardSession({dashboardDir:directory,port:4320,start:async()=>({state:'ready',stop:async()=>'not-held',companion:{origin:'http://127.0.0.1:4318',bootstrap:readCompanionBootstrap(4318)}})});await session.listen();await session.begin();return {close:()=>session.end()};}
try{
 run('npm',['install','--save-dev','--ignore-scripts','--no-audit','--no-fund',tarball]);
 assert.match(run('npx',['--no-install',...(wrapper?['rtl-analyzer']:scanEntry),'--help']),wrapper?/rtl-analyzer scan/:/Usage: rtl-scanner/);if(wrapper)evidence.version=run('npx',['--no-install','rtl-analyzer','--version']).trim();assert.match(run('npx',['--no-install',...previewEntry,'--help']),/Usage:.*rtl-preview/);run('npx',['--no-install',...previewEntry,'--unknown'],2);
 if(process.platform==='win32'){
  // v0.5.0 Windows contract: report publication is unsupported and refused before any write (see README "Platform support").
  verifyWindowsUnsupportedPublication();
 }else{
 if(wrapper){
  const metadata=JSON.parse(readFileSync(join(project,'node_modules/rtl-analyzer/package.json'),'utf8'));
  evidence.implementation=metadata.rtlAnalyzerImplementation;
  evidence.installed=JSON.parse(run('npm',['ls','--depth=0','--json'])).dependencies;
  // The default run writes the dashboard to its report file and reports the path on stderr; HTML is never echoed to stdout.
  assert.doesNotMatch(run('npx',['--no-install','rtl-analyzer']),/<!doctype html>/i);
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
 const previewLaunch=binaryInvocation(project,'rtl-analyzer',previewEntry[0],previewEntry.slice(1));children.push(spawn(previewLaunch.file,previewLaunch.args,{cwd:project,env,stdio:['ignore','pipe','pipe']}));// The dashboard is served by the packaged DashboardSession, as the CLI serves it, so the page receives its companion session.
 staticReports=await startDashboardSession(project,reports);
 for(const [i,c] of children.entries())for(const stream of [c.stdout,c.stderr])stream.on('data',b=>writeFileSync(join(workspace,`service-${i}.log`),b,{flag:'a'}));
 for(const url of ['http://127.0.0.1:4318/health','http://127.0.0.1:4320/rtl-report-dashboard.html']){let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,url)}
 assert.equal((await fetch('http://127.0.0.1:4318/health').then(r=>r.json())).projectRootDigest,createHash('sha256').update(project).digest('hex'));
 // Origin validation is checked after session authorization: a valid session with a foreign or missing Origin must still be refused.
 const bootstrapFile=join(tmpdir(),'rtl-analyzer-auth-'+userInfo().uid,'companion-4318.json');
 const session=await fetch('http://127.0.0.1:4318/auth/session',{method:'POST',headers:{'x-rtl-companion-bootstrap':JSON.parse(readFileSync(bootstrapFile,'utf8')).bootstrap}}).then(r=>r.json());
 for(const path of ['/review/manual-changes','/review/rescan','/review/workflows'])for(const origin of ['http://untrusted.invalid',undefined]){
  const response=await fetch('http://127.0.0.1:4318'+path,{method:'POST',headers:{'content-type':'application/json','x-rtl-companion-session':session.token,...(origin?{Origin:origin}:{})},body:'{malformed'});
  assert.equal(response.status,403);assert.equal((await response.json()).error,'ORIGIN_NOT_ALLOWED');
 }
 evidence.deniedWrites=6;
 const require=createRequire(join(project,'package.json')),{chromium,expect}=require('@playwright/test');browser=await chromium.launch({headless:true});
 const finding=report.findings.find(f=>f.context==='stylesheet/.contact-card');assert.ok(finding);const unmapped=report.findings.find(f=>f.context==='stylesheet/.unmapped'),initialDirection=report.findings.find(f=>f.ruleId==='RTL.DOCUMENT.INITIAL');assert.ok(unmapped&&initialDirection);const original=readFileSync(join(project,'src/reading.css'),'utf8');
 const hashes=()=>Object.fromEntries(report.files.map(p=>[p,createHash('sha256').update(readFileSync(join(project,p))).digest('hex')])),initialHashes=hashes();evidence.originalHashes=initialHashes;save();
 for(const mode of ['one-by-one','apply-first']){
  const context=await browser.newContext({viewport:{width:1600,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html?finding='+encodeURIComponent(finding.id));await page.getByRole('button',{name:mode==='one-by-one'?'Start manual review':'Prepare all & review',exact:true}).click();
  const before=page.locator('.component-before .embedded-state'),after=page.locator('.component-after .embedded-state');
  if(mode==='apply-first'){await expect(page.locator('.batch-review')).toBeVisible({timeout:60000});const marginRow=page.getByRole('checkbox',{name:'Select src/reading.css '+proposal.before,exact:true}).locator('xpath=ancestor::tr');await marginRow.getByRole('button',{name:'View diff',exact:true}).click();}
  await expect(before).toHaveAttribute('data-context-status','verified',{timeout:60000});await expect(after).toHaveAttribute('data-preparation-state','ready',{timeout:60000});
  const query=new URLSearchParams({mode,inputDigest:report.inputDigest,policyDigest:report.policyDigest}),snapshot=()=>fetch('http://127.0.0.1:4318/review/workflows?'+query).then(r=>r.json()).then(r=>r.workflow);let pending=await snapshot();assert.ok(pending.entries.every(e=>e.decision==='Pending'));assert.equal(pending.validation,undefined);assert.deepEqual(hashes(),initialHashes);
  if(mode==='one-by-one'){const prior=pending;await page.getByRole('button',{name:'Review actions',exact:true}).click();await page.getByRole('menuitem',{name:'Start new review',exact:true}).click();await expect(after).toHaveAttribute('data-preparation-state','ready',{timeout:60000});pending=await snapshot();assert.notEqual(pending.id,prior.id);await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByLabel('Historical review',{exact:true}).selectOption(prior.id);await expect(page.locator('.review-state-badge')).toHaveText('Superseded');await page.keyboard.press('Escape');}
  const result={mode,proposal,workflowId:pending.id,pendingPatches:pending.entries.filter(e=>e.applied).length};if(mode==='apply-first')assert.ok(pending.entries.filter(e=>e.batch?.state==='ready'&&e.patch).every(e=>e.applied));
  for(const dir of ['RTL','LTR']){await page.locator('.component-toolbar').getByRole('button',{name:dir,exact:true}).click();await expect(before).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(after).toHaveAttribute('data-context-status','verified',{timeout:30000});for(const role of ['before','after'])await expect(page.frameLocator(`.component-${role} iframe`).locator('html')).toHaveAttribute('dir',dir.toLowerCase());assert.equal(await page.frameLocator('.component-after iframe').locator('.contact-card').evaluate((n,p)=>getComputedStyle(n)[p],dir==='RTL'?proposal.rtl:proposal.ltr),proposal.width);}
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
  await page.getByRole('dialog',{name:'Validation passed'}).getByRole('button',{name:'Apply 1 changes…',exact:true}).click();const applyConfirmation=page.getByRole('dialog',{name:'Apply changes to source'});await expect(applyConfirmation).toContainText('1 accepted and validated changes');await applyConfirmation.getByRole('button',{name:'Apply to source',exact:true}).click();await expect(page.locator('.workflow-summary')).toContainText('Applied',{timeout:30000});assert.equal(readFileSync(join(project,'src/reading.css'),'utf8'),original.replace(proposal.before,proposal.after));const applied=await fetch('http://127.0.0.1:4318/review/workflows/'+pending.id).then(r=>r.json()).then(r=>r.workflow);assert.equal(applied.receipts.length,1);result.receipts=applied.receipts.length;result.appliedHashes=hashes();
  await page.getByRole('dialog',{name:'Changes applied'}).getByRole('button',{name:'View applied changes / operation details',exact:true}).click();await expect(page.getByRole('dialog',{name:'Session details'})).toBeVisible();await page.getByRole('button',{name:'History',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Historical results do not validate');await page.getByRole('tab',{name:'Technical',exact:true}).click();await expect(page.locator('.historical-context')).not.toContainText('undefined');await expect(page.locator('.historical-context')).toContainText('Current analysis ');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Review actions',exact:true}).click();await page.getByRole('menuitem',{name:'Rollback applied changes',exact:true}).click();
  await expect.poll(()=>readFileSync(join(project,'src/reading.css'),'utf8')).toBe(original);await expect(page.locator('.session-validation')).toContainText('Not run',{timeout:30000});await expect(before).toHaveAttribute('data-context-status','verified',{timeout:30000});await expect(after).toHaveAttribute('data-preparation-state','ready',{timeout:30000});const resumed=await snapshot();assert.notEqual(resumed.id,pending.id);assert.equal(resumed.resumedFrom,pending.id);assert.ok(resumed.entries.every(e=>e.decision==='Pending'));assert.equal(resumed.validation,undefined);assert.deepEqual(hashes(),initialHashes);assert.deepEqual(errors,[]);result.rollback='all scanned hashes restored; fresh Pending / Not run';result.rollbackHashes=hashes();await page.getByRole('button',{name:'Session details',exact:true}).click();await page.getByRole('button',{name:'History',exact:true}).click();await page.getByLabel('Historical review',{exact:true}).selectOption(pending.id);await expect(page.locator('.review-state-badge')).toHaveText('Rolled back');await page.keyboard.press('Escape');evidence.modes.push(result);save();await page.screenshot({path:join(workspace,mode+'-restored.png'),fullPage:true});await context.close();
 }
 // Check absent-target and informational findings in their own direct selections. Workflow selection contains only reviewable records.
 const negativeContext=await browser.newContext({viewport:{width:1600,height:1000}}),negativePage=await negativeContext.newPage();
 await negativePage.goto('http://127.0.0.1:4320/rtl-report-dashboard.html?finding='+encodeURIComponent(unmapped.id));await negativePage.getByRole('button',{name:'Start manual review',exact:true}).click();
 const negativeState=negativePage.locator('.component-before .embedded-state');await expect(negativeState).toHaveAttribute('data-context-status','missing-target',{timeout:60000});await expect(negativeState).toHaveAttribute('data-target-count','0');await expect(negativeState).toContainText('Source rule loaded; configured target is missing on this route');await expect(negativePage.getByRole('button',{name:'Approve proposed change',exact:true})).toBeDisabled();evidence.negativeMapping={findingId:unmapped.id,route:'/people',state:'missing-target',targetCount:0,approvalDisabled:true,atlasFallback:false};
 assert.equal(initialDirection.ruleId,'RTL.DOCUMENT.INITIAL');assert.ok(initialDirection.suggestion==null);evidence.initialDirection={findingId:initialDirection.id,state:'informational without proposed change'};save();await negativeContext.close();
 // Bidi isolation is independent of inherited direction; it still requires approval and normal runtime validation.
 const bidi=report.findings.find(f=>f.ruleId==='RTL.BIDI.ISOLATION');assert.ok(bidi);
 const call=async(path,body)=>{const response=await fetch('http://127.0.0.1:4318/review/workflows'+path,{method:'POST',headers:{'content-type':'application/json',Origin:'http://127.0.0.1:4320'},body:JSON.stringify(body)});const result=await response.json();assert.ok(response.ok,JSON.stringify(result));return result.workflow};
 let independent=await call('',{mode:'one-by-one',scope:[],inputDigest:report.inputDigest,policyDigest:report.policyDigest,restart:true});
 assert.ok(independent.entries.find(e=>e.finding.id===bidi.id)?.patch,'independent patch remains available under uncertainty');
 independent=await call('/'+independent.id+'/change',{findingId:bidi.id,action:'apply'});independent=await call('/'+independent.id+'/change',{findingId:bidi.id,action:'Accepted'});
 independent=await call('/'+independent.id+'/validate',{});assert.equal(independent.validationPresentation.status,'Passed');assert.equal(independent.applyEligibility.eligible,true);
 independent=await call('/'+independent.id+'/apply',{confirmation:'APPLY_CONFIRMED'});assert.equal(independent.state,'Applied');assert.match(readFileSync(join(project,'src/main.tsx'),'utf8'),/<bdi dir="auto">\{person.name\}<\/bdi>/);
 independent=await call('/'+independent.id+'/rollback',{confirmation:'ROLLBACK_CONFIRMED'});assert.equal(independent.state,'Rolled Back');assert.deepEqual(hashes(),initialHashes);evidence.independent={findingId:bidi.id,result:'accepted, validated, applied and rolled back under unresolved runtime direction'};save();
 evidence.status='Passed';save();console.log('CONSUMER_PASSED',JSON.stringify(evidence));
 }
}catch(e){evidence.status='Failed';evidence.error=e.stack;save();throw e}
finally{await browser?.close();for(const c of children.reverse())if(c.exitCode===null&&c.signalCode===null){const done=new Promise(r=>c.once('exit',r));c.kill('SIGTERM');await done}await staticReports?.close();disposeSmokeTemporaries(smokeStartedAt)}
// Cleanup must release every smoke port; a leftover listener would make the next run fail for an unrelated reason.
for(const port of [4215,4318,4320])await new Promise((yes,no)=>{const s=createServer();s.once('error',()=>no(new Error(`port ${port} is still in use after smoke cleanup`)));s.listen(port,'127.0.0.1',()=>s.close(yes))});
