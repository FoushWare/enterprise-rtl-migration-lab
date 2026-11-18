import {spawn,type ChildProcess,type SpawnOptions} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {loadProjectConfiguration} from './project-configuration.js';
import {loadPreviewConfiguration} from './preview-configuration.js';

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
  return spawn(command,args,{cwd:root,stdio:'ignore',...options,shell:false,detached:process.platform!=='win32'});
}
export function signalOwnedRuntime(child:ChildProcess,signal:NodeJS.Signals='SIGTERM') {
  if(child.exitCode!==null||child.signalCode!==null||!child.pid)return;
  try{if(process.platform==='win32')child.kill(signal);else process.kill(-child.pid,signal);}catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;}
}
