import {readFile, lstat} from 'node:fs/promises';
import {join, isAbsolute} from 'node:path';
import {previewFile} from './preview-configuration.js';

export const PROJECT_CONFIGURATION = 'rtl-project.config.json';
export interface ProjectConfiguration {
  schemaVersion: 1;
  scanRoots: string[];
  copyPaths: string[];
  packageManager: 'npm' | 'pnpm' | 'yarn';
  validation: Partial<Record<'typecheck' | 'build' | 'test', string[]>>;
}
export function projectRelativePath(value: unknown): asserts value is string {
  if(typeof value !== 'string' || !value || value.length > 1000 || isAbsolute(value) || /[\\\x00-\x1f]/.test(value) || value.split('/').some(p => !p || p === '.' || p === '..' || ['node_modules','.git','.rtl-preview','.rtl-vite-cache','dist'].includes(p))) throw Error('PROJECT_CONFIGURATION_INVALID_PATH');
}
export async function loadProjectConfiguration(root: string): Promise<ProjectConfiguration | undefined> {
  let raw: string;
  try { const path=join(root,PROJECT_CONFIGURATION); if((await lstat(path)).isSymbolicLink())throw Error('PROJECT_CONFIGURATION_SYMLINK'); raw=await readFile(path,'utf8'); }
  catch(error){if((error as NodeJS.ErrnoException).code === 'ENOENT')return; throw error;}
  if(raw.length>100000)throw Error('PROJECT_CONFIGURATION_SIZE');
  const c=JSON.parse(raw) as ProjectConfiguration;
  if(!c || c.schemaVersion!==1 || Object.keys(c).some(k=>!['schemaVersion','scanRoots','copyPaths','packageManager','validation'].includes(k)) || !['npm','pnpm','yarn'].includes(c.packageManager) || !c.validation || typeof c.validation!=='object' || Array.isArray(c.validation))throw Error('PROJECT_CONFIGURATION_INVALID');
  for(const paths of [c.scanRoots,c.copyPaths]) {
    if(!Array.isArray(paths)||!paths.length||paths.length>100||new Set(paths).size!==paths.length)throw Error('PROJECT_CONFIGURATION_INVALID_SCOPE');
    for(const path of paths){projectRelativePath(path); /* Check every ancestor, including directories. */ await previewFile(root,path,true);}
  }
  if(c.scanRoots.some(path=>!c.copyPaths.some(copy=>path===copy||path.startsWith(copy+'/'))))throw Error('PROJECT_CONFIGURATION_SCAN_NOT_COPIED');
  for(const [name,args] of Object.entries(c.validation))if(!['typecheck','build','test'].includes(name)||!Array.isArray(args)||!args.length||args.length>30||args.some(a=>typeof a!=='string'||!a||a.length>1000||/[\x00-\x1f]/.test(a)))throw Error('PROJECT_CONFIGURATION_INVALID_CHECK');
  return c;
}
