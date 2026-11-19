// Each scenario owns a fresh standalone target and its children; historical targets are retained.
import {spawn} from 'node:child_process';import {mkdirSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
const outputPrefix=process.env.RTL_WORKSPACE_OUTPUT_PREFIX||'test-results/review-workspace';
const audit=resolve(outputPrefix+'-audit');mkdirSync(audit,{recursive:true});
for(const scenario of (process.env.RTL_WORKSPACE_SCENARIOS||'full,limited,failed,none').split(',')){
 let server,tests;
 try{
  const env={...process.env,RTL_VALIDATION_SCENARIO:scenario,RTL_PREVIEW_UI_FIXTURE:'1',RTL_ONBOARDING_INSTALL:'1'};
  server=spawn(process.execPath,['tests/e2e/serve-independent-onboarding.mjs'],{env,stdio:['ignore','pipe','pipe']});
  let log='';const record=chunk=>{log+=chunk.toString();writeFileSync(resolve(audit,scenario+'-server-final.log'),log)};server.stderr.on('data',record);
  const environment=await new Promise((yes,no)=>{server.stdout.on('data',chunk=>{record(chunk);const match=log.match(/ONBOARDING_ENVIRONMENT (.+?) \{/);if(match)yes(match[1])});server.once('exit',code=>no(Error('Server exited '+code)));});
  for(const url of ['http://127.0.0.1:4318/health','http://127.0.0.1:4320/rtl-report-dashboard.html']){let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}if(!ready)throw Error('Unavailable '+url)}
  writeFileSync(resolve(audit,scenario+'-environment-path.txt'),environment+'\n');
  const specs=scenario==='full'?['automatic-after','preview-ui-state','review-workspace']:['review-workspace'];
  tests=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','--config=playwright.manual-preview.config.ts',...specs.map(s=>'tests/e2e/'+s+'.spec.ts'),'--output='+outputPrefix+'-'+scenario+'-final'],{env:{...env,RTL_MANUAL_ENVIRONMENT:environment},stdio:'inherit'});
  const code=await new Promise(r=>tests.once('exit',r));if(code)throw Error(scenario+' tests failed: '+code);console.log('WORKSPACE_SCENARIO_PASSED',scenario,environment);
 }finally{
  if(tests&&tests.exitCode===null&&tests.signalCode===null)tests.kill('SIGTERM');
  if(server&&server.exitCode===null&&server.signalCode===null){const stopped=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await stopped}
 }
}
