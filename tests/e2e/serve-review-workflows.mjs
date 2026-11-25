// Disposable Atlas target, real scanner output and real app runtime. Ctrl-C stops only owned children.
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, cpSync, mkdirSync, rmSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { RUNTIME_DIR, dashboard as baselineDashboard, project, repo, state } from './portable-fixture.mjs';
import { writePreviewRuntimeConfig } from '../../dist/tools/rtl-scanner/preview-runtime.js';

const dashboard=join(dirname(baselineDashboard),'workflow-dashboard');mkdirSync(dashboard);
// Repeated expressions across files, plus unsupported content sinks. No working-source writes.
const sourcePath = join(project, 'apps/invoicing/src/components/InvoiceTable.tsx');
if(!process.env.RTL_CONTEXTUAL_BASELINE){
writeFileSync(sourcePath, readFileSync(sourcePath, 'utf8').replace('import { useLocale }', 'import { ReviewTokens } from "./ReviewTokens";\nimport { useLocale }').replace('              {i.id}\n', '              {i.id}<span className="review-extra-id">{i.id}</span><ReviewTokens item={i} />\n'));
writeFileSync(join(project, 'apps/invoicing/src/components/ReviewTokens.tsx'), 'export function ReviewTokens({item}:{item:{id:string}}){return <><span className="token-one">{item.id}</span><span className="token-two">{item.id}</span></>}\n');
}
// Opt-in spacing fixtures exercise analyzer dispatch on arbitrary filenames; app sources in checkout stay untouched.
if(process.env.RTL_SPACING_FIXTURE){
 const dir=join(project,'apps/invoicing/src');
 writeFileSync(join(dir,'arbitrary-spacing.css'),'.spacing-a { margin-left: 12px !important; padding-right: 8px; }\n.spacing-b { margin-right: 20px; }\n.spacing-conflict { margin: 2px; margin-left: 9px; }\n.spacing-logical { padding-inline-start: 3px; padding-left: 7px; }\n.spacing-physical { /* rtl-physical: coordinates intentionally physical */ margin-left: 13px; }\n');
 writeFileSync(join(dir,'unrelated-name.css'),'.spacing-c { padding-left: 16px; }\n');
 const main=join(dir,'main.tsx');writeFileSync(main,"import './arbitrary-spacing.css';\nimport './unrelated-name.css';\n"+readFileSync(main,'utf8'));
 const html=join(project,'apps/invoicing/index.html');writeFileSync(html,readFileSync(html,'utf8').replace('<body>', '<body><div id="spacing-probes"><div class="spacing-a">A</div><div class="spacing-b">B</div><div class="spacing-c">C</div></div>'));
}
// Finite expansion probes exercise shared analyzer families against real rendering.
if(process.env.RTL_EXPANSION_FIXTURE){
 const dir=join(project,'apps/invoicing/src');
 writeFileSync(join(dir,'odd-edges.css'),'.edge-align { text-align: left; }\n.edge-offset { position: absolute; left: 12px; top: 4px; width: 30px; height: 20px; }\n.edge-border { border-left: 3px solid red; border-top-right-radius: 9px; }\n.edge-icon { /* rtl-icon: progression-right */ display: inline-block; width: 24px; height: 24px; }\n.edge-conflict { inset-inline-start: 1px; left: 2px; position: absolute; }\n.edge-intent { /* rtl-physical: coordinate plane */ text-align: right; }\n.edge-shorthand { border-radius: 1px 2px 3px 4px; }\n');
 writeFileSync(join(dir,'another-random-name.css'),'.edge-secondary { padding-right: 7px; text-align: right; }\n');
 writeFileSync(join(dir,'components/StrangeProbe.tsx'),'export function StrangeProbe(){const person={name:"ليلى (Laila)",email:"laila@example.test",address:"القاهرة 12 Main St"};return <section id="inline-probes"><p id="mixed-copy">({person.email}) / {person.name} / {person.address}</p><div id="inline-style" style={{marginLeft:11,textAlign:"right",borderBottomLeftRadius:6}}>Inline</div><div className="ml-4 text-left">Utility detection only</div><svg className="unmarked-icon" width="24" height="24"><path d="M1 1L23 12L1 23Z" /></svg></section>}\n');
 const main=join(dir,'main.tsx');writeFileSync(main,"import './odd-edges.css';\nimport './another-random-name.css';\n"+readFileSync(main,'utf8'));
 const source=readFileSync(sourcePath,'utf8');writeFileSync(sourcePath,'import {StrangeProbe} from "./StrangeProbe";\n'+source.replace('{i.id}<span','{i.id}<StrangeProbe/><span'));
 const html=join(project,'apps/invoicing/index.html');writeFileSync(html,readFileSync(html,'utf8').replace('<body>','<body><section id="expansion-probes" style="position:relative;z-index:1;margin:16px 280px;padding:8px;background:white"><div class="edge-align" style="width:220px">Reading edge</div><div id="offset-parent" style="position:relative;width:240px;height:48px"><div class="edge-offset"></div></div><div class="edge-border" style="width:100px;height:32px">Border</div><svg class="edge-icon" viewBox="0 0 24 24"><path d="M1 1L23 12L1 23Z" /></svg><div class="edge-secondary">Secondary</div></section>'));
}
// Explicit demonstration bindings, not automatic source/route discovery.
if(process.env.RTL_EXPANSION_FIXTURE){
 const routes=[{id:'invoices',path:'/invoices',ltr:'/invoices?demo=unmigrated-rtl&lang=en',rtl:'/invoices?demo=unmigrated-rtl&lang=ar'},{id:'customers',path:'/customers',ltr:'/customers?demo=unmigrated-rtl&lang=en',rtl:'/customers?demo=unmigrated-rtl&lang=ar'}];
 const refs=routes.map(r=>({application:'invoicing',route:r.id}));
 writeFileSync(join(project,'rtl-preview.config.json'),JSON.stringify({schemaVersion:1,applications:{invoicing:{viteConfig:'apps/invoicing/vite.config.ts',entry:'apps/invoicing/src/main.tsx',originalOrigin:'http://127.0.0.1:4200',readySelector:'#root > *',dataAdapter:'atlas',routes}},mappings:[...['.edge-align','.edge-offset','.edge-border','.edge-icon'].map(selector=>({source:'apps/invoicing/src/odd-edges.css',sourceSelector:selector,targetSelector:selector,routes:refs})),{source:'apps/invoicing/src/another-random-name.css',sourceSelector:'.edge-secondary',targetSelector:'.edge-secondary',routes:refs}]},null,2));
}
// Preserve the target's actual configured checks, harness and toolchain; no reduced substitute tests.
for(const name of ['tests','tools','.storybook']) if(existsSync(join(repo,name))) cpSync(join(repo,name),join(project,name),{recursive:true});
for(const name of readdirSync(repo).filter(name=>/^(tsconfig.*\.json|(?:vite|vitest|playwright|eslint)(?:\.[\w-]+)*\.config\.[cm]?[jt]s|package-lock\.json)$/.test(name))) cpSync(join(repo,name),join(project,name));
// Publish a new report directory after adding only disposable source findings.
execFileSync(process.execPath,[join(RUNTIME_DIR,'cli.js'),'--root',project,'--format','dashboard','--embed-source-snippets','--output-dir',dashboard],{cwd:repo,stdio:['ignore','ignore','inherit']});
for (const port of [4200,4201,4318,4320]) await new Promise((resolve,reject)=>{const probe=createServer();probe.once('error',()=>reject(Error('Port '+port+' occupied; no unrelated process was stopped.')));probe.listen(port,'127.0.0.1',()=>probe.close(resolve))});
const originalConfig=await writePreviewRuntimeConfig(project,{role:'original',sessionId:'original',sourceSha256:createHash('sha256').update(readFileSync(sourcePath)).digest('hex')});
const procurementConfig=await writePreviewRuntimeConfig(project,{role:'original',sessionId:'original',sourceSha256:createHash('sha256').update(readFileSync(join(project,'apps/procurement/src/App.tsx'))).digest('hex')},{application:'procurement'});
const env={...process.env,RTL_PROJECT_ROOT:project,RTL_REVIEW_STORE_PATH:join(state,'review-records-v1.json'),RTL_EVIDENCE_STORE_PATH:join(state,'review-evidence-v1.json'),RTL_MANUAL_CHANGE_STORE_PATH:join(state,'manual-changes-v1.json'),RTL_SCAN_MANIFEST_STORE_PATH:join(state,'scan-manifests-v1.json'),RTL_AUDIT_STORE_PATH:join(state,'apply-audit-v1.json'),RTL_APPLY_BACKUP_ROOT:join(state,'backups')};
let companion;
const startCompanion=()=>companion=spawn(process.execPath,[join(RUNTIME_DIR,'preview-companion.js')],{cwd:repo,env:{...env,RTL_PREVIEW_OWNER_PID:String(process.pid)},stdio:'inherit'});
const children=[startCompanion(),spawn(process.execPath,[join(repo,'node_modules/vite/bin/vite.js'),'--config',originalConfig,'--host','127.0.0.1','--port','4200','--strictPort'],{cwd:project,env:{...process.env,RTL_RUNTIME_OWNER_PID:String(process.pid)},stdio:'inherit'}),spawn(process.execPath,[join(repo,'node_modules/vite/bin/vite.js'),'--config',procurementConfig,'--host','127.0.0.1','--port','4201','--strictPort'],{cwd:project,env:{...process.env,RTL_RUNTIME_OWNER_PID:String(process.pid)},stdio:'inherit'}),spawn(process.execPath,[join(repo,'tests/e2e/dashboard-session-server.mjs'),dashboard],{cwd:dashboard,env:{...process.env,RTL_HARNESS_OWNER_PID:String(process.pid),RTL_E2E_RUNTIME:RUNTIME_DIR},stdio:'inherit'})];
const identity={supervisorPid:process.pid,project,dashboard,state,children:children.map(c=>c.pid),dashboardUrl:'http://127.0.0.1:4320/rtl-report-dashboard.html'};
const environmentPath=join(dirname(project),'environment.json');
const publish=()=>writeFileSync(environmentPath,JSON.stringify({...identity,companionPid:companion.pid},null,2));publish();console.log('REVIEW_WORKFLOWS_ENVIRONMENT',environmentPath,JSON.stringify(identity));
let stopping=false,restarting=false,resumeRequested=false;
async function stop(){if(stopping)return;stopping=true;await Promise.all([...children.filter(c=>c!==children[0]),companion].map(c=>new Promise(resolve=>{if(c.exitCode!==null||c.signalCode!==null)return resolve();c.once('exit',resolve);c.kill('SIGTERM')})));
  // Full supervisor shutdown cleans only candidates recorded for this disposable target. Companion-only restarts retain them.
  try{const data=JSON.parse(readFileSync(join(state,'backups/review-workflows-v1.json'),'utf8'));for(const w of data.workflows){const candidate=w.session?.candidateRoot;if(w.root===project&&candidate&&dirname(realpathSync(candidate))===realpathSync(tmpdir())&&candidate.split('/').at(-1).startsWith('rtl-review-'))rmSync(candidate,{recursive:true,force:true})}}catch(error){if(error.code!=='ENOENT')console.error('Candidate cleanup:',error.message)}
  process.exit(0)}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
// Explicit test-only service outage/restart controls, preserving candidate roots and persisted sessions.
process.on('SIGUSR1',()=>{if(!restarting&&companion.exitCode===null){restarting=true;companion.once('exit',()=>{restarting=false;if(resumeRequested&&!stopping){resumeRequested=false;startCompanion()}publish()});companion.kill('SIGTERM')}});
// Health can become unavailable before the old child emits exit. Retain an early resume signal.
process.on('SIGUSR2',()=>{if(stopping)return;if(restarting){resumeRequested=true;return}if(companion.exitCode!==null){startCompanion();publish()}});
