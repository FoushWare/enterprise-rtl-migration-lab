import { scan } from './scan.js';
import { json, markdown } from './report.js';
let root=process.cwd();let format='json';
try {
  const args=process.argv.slice(2);
  for(let i=0;i<args.length;i+=2){const key=args[i],value=args[i+1];if(!value||value.startsWith('--'))throw new Error('Missing option value');if(key==='--root')root=value;else if(key==='--format'&&['json','markdown'].includes(value))format=value;else throw new Error('Unknown option or format');}
  const r=await scan(root);process.stdout.write(format==='markdown'?markdown(r):json(r));if(!r.complete)process.exitCode=2;
}catch(e){console.error(e instanceof Error?e.message:'Scan failed');process.exitCode=2;}
