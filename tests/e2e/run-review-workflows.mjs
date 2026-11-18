// Runs the real served dashboard suite in an owned disposable environment.
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
let server,tests,stopping=false;
async function stop(){if(stopping)return;stopping=true;if(tests&&tests.exitCode===null)tests.kill('SIGTERM');if(server&&server.exitCode===null){const exited=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await exited}}
process.on('SIGINT',()=>void stop());process.on('SIGTERM',()=>void stop());
try{
  server=spawn(process.execPath,['tests/e2e/serve-review-workflows.mjs'],{stdio:['ignore','pipe','inherit']});
  const environment=await new Promise((resolveEnv,reject)=>{let output='';server.stdout.on('data',chunk=>{process.stdout.write(chunk);output+=chunk.toString();const match=output.match(/REVIEW_WORKFLOWS_ENVIRONMENT (.+?) \{/);if(match)resolveEnv(match[1])});server.once('exit',code=>reject(Error('Disposable services failed to start: '+code)))});
  // Wait for all services using actual health/route endpoints.
  for(const url of ['http://127.0.0.1:4318/health','http://127.0.0.1:4200/invoices','http://127.0.0.1:4201/','http://127.0.0.1:4320/rtl-report-dashboard.html']){
    let ready=false;for(let attempt=0;attempt<100;attempt++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}if(!ready)throw Error('Service unavailable: '+url);
  }
  const output=resolve('test-results/review-workflows-'+new Date().toISOString().replaceAll(':','-'));
  const specs=(process.env.RTL_REVIEW_SPECS||'tests/e2e/review-workflows-complete.spec.ts').split(',');
  tests=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','--config=playwright.manual-preview.config.ts',...specs,'--output='+output,...process.argv.slice(2)],{env:{...process.env,RTL_MANUAL_ENVIRONMENT:environment},stdio:'inherit'});
  process.exitCode=await new Promise(r=>tests.once('exit',code=>r(code??1)));console.log('WORKFLOW_EVIDENCE',output);
}finally{await stop()}
