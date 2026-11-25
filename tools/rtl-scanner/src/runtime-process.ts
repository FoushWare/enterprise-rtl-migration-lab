import {type ChildProcess,type SpawnOptions} from 'node:child_process';
import {spawnOwned} from './owned-processes.js';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {loadProjectConfiguration} from './project-configuration.js';
import {loadPreviewConfiguration} from './preview-configuration.js';

/** Bytes of the most recent child output kept per runtime. Older output is discarded, so memory stays bounded. */
export const RUNTIME_OUTPUT_LIMIT=8192;
const outputTails=new WeakMap<ChildProcess,string>();

/**
 * Keeps the last RUNTIME_OUTPUT_LIMIT characters of a child's stdout and stderr (ANSI escapes stripped). Nothing is
 * written to disk here; the caller decides what to expose and must redact before it leaves the process.
 */
export function captureRuntimeOutput(child:ChildProcess){
  outputTails.set(child,'');
  const add=(chunk:Buffer|string)=>{
    const text=String(chunk).replace(/\u001b\[[0-9;?]*[ -\/]*[@-~]/g,'');
    outputTails.set(child,(outputTails.get(child)??'').concat(text).slice(-RUNTIME_OUTPUT_LIMIT));
  };
  child.stdout?.on('data',add);
  child.stderr?.on('data',add);
}

/** Last bounded output of a runtime started by spawnPreviewRuntime. Empty when none was captured. */
export function runtimeOutputTail(child:ChildProcess):string{return outputTails.get(child)??''}

/**
 * Redacts captured output before it leaves this process: credentials in URLs, bearer tokens, values of secret-named
 * keys, and environment-style lines. Home-directory prefixes become `~`. Lines and total size stay bounded.
 */
export function redactRuntimeOutput(text:string,home=homedir()):string{
  const redacted=text
    .split(home.length>1?home:'\u0000').join('~')
    .replace(/\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+@/gi,'$1[redacted]@')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,'Bearer [redacted]')
    .replace(/((?:token|secret|password|passwd|api[_-]?key|authorization|cookie|credential)[\w.-]*\s*[=:]\s*)\S+/gi,'$1[redacted]')
    .replace(/^[ \t]*[A-Z][A-Z0-9_]{2,}=.*$/gm,'[environment line removed]');
  return redacted.split('\n').slice(-40).map(line=>line.slice(0,400)).join('\n').slice(-RUNTIME_OUTPUT_LIMIT);
}

/** Vite adapter only: configured dev scripts must forward standard Vite CLI arguments. */
export async function spawnPreviewRuntime(root:string,application:string,config:string,port:number,options:SpawnOptions={}) {
  const app=(await loadPreviewConfiguration(root)).applications[application];
  const project=await loadProjectConfiguration(root);
  const flags=['--config',config,'--host','127.0.0.1','--port',String(port),'--strictPort'];
  let command=process.execPath,args=[join(root,'node_modules/vite/bin/vite.js'),...flags];
  if(app?.startupScript){
    const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
    if(typeof pkg.scripts?.[app.startupScript]!=='string')throw Error('PREVIEW_STARTUP_SCRIPT_MISSING');
    command=project?.packageManager??'npm';args=['run',app.startupScript,...(command==='npm'?['--']:[]),...flags];
  }
  // A separate process group includes npm's Vite child. Never signal a port owner or an adopted PID.
  // The runtime watches this PID (see runtime-owner.ts) and exits when its companion is gone, even after SIGKILL.
  const child=spawnOwned(command,args,{cwd:root,stdio:['ignore','pipe','pipe'],...options,env:{...(options.env??process.env),RTL_RUNTIME_OWNER_PID:String(process.pid)},shell:false,label:'runtime:'+application,root});
  captureRuntimeOutput(child);
  return child;
}
export function signalOwnedRuntime(child:ChildProcess,signal:NodeJS.Signals='SIGTERM') {
  if(child.exitCode!==null||child.signalCode!==null||!child.pid)return;
  try{if(process.platform==='win32')child.kill(signal);else process.kill(-child.pid,signal);}catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;}
}
