import { mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { scan } from './scan.js';
import { type ContextMapping, type PreviewApplication } from './example-preview-mappings.js';
import { writeRuntimeState } from './preview-runtime-state.js';
import { fileURLToPath } from 'node:url';
import {loadPreviewConfiguration,configuredMapping,runtimeConfigName,previewFile} from './preview-configuration.js';
import postcss, { type Declaration } from 'postcss';
// postcss declares AtRule's `type` as the base `string`, so `type === 'decl'` alone does not narrow the ChildNode union.
const isDeclaration = (node: unknown): node is Declaration => (node as { type?: unknown }).type === 'decl';
import { DASHBOARD_ORIGIN } from './companion-security.js';

const scriptJson=(value:unknown)=>JSON.stringify(value).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');

export interface PreviewRuntimeIdentity { role: 'original' | 'candidate'; sessionId: string; sourceSha256: string }

/** Only generated local preview configs install this bridge; production app files stay untouched. */
export async function writePreviewRuntimeConfig(root: string, identity: PreviewRuntimeIdentity, options: { application?: PreviewApplication; contextRoot?: string } = {}): Promise<string> {
  const directory = join(root, '.rtl-preview');
  await mkdir(directory, { recursive: true });
  const application = options.application ?? 'invoicing';
  const configuration=await loadPreviewConfiguration(root),configured=configuration.applications[application];
  const dataAdapter=configured?.dataAdapter??'atlas';
  const entry=configured?.entry??'apps/'+application+'/src/main.tsx';
  const viteConfig=configured?.viteConfig??'apps/'+application+'/vite.config.ts';
  if(configured)await previewFile(root,viteConfig);
  const runtimeIdentity = { ...identity, projectRoot: await realpath(root), application, previewConfigDigest:configuration.digest,inputDigest:'', policyDigest:'' };
  const sourceHashes: Record<string,string> = {};
  let bindings: { finding: {id:string;path:string}; mapping: ContextMapping }[] = [];
  const hasApps = await stat(join(root,'apps')).then(value=>value.isDirectory()).catch(error=>{if(error.code==='ENOENT')return false;throw error});
  if(hasApps||Object.keys(configuration.applications).length) {
    const report = await scan(options.contextRoot ?? root);
    if(!report.complete)throw Error('CONTEXT_SCAN_INCOMPLETE');
    runtimeIdentity.inputDigest=report.inputDigest;runtimeIdentity.policyDigest=report.policyDigest;
    for (const path of report.files) sourceHashes[path] = createHash('sha256').update(await readFile(join(root,path))).digest('hex');
    const bindingConfiguration=options.contextRoot?await loadPreviewConfiguration(options.contextRoot):configuration;
    bindings = report.findings.map(f=>({finding:{id:f.id,path:f.path},mapping:configuredMapping(f,bindingConfiguration)})).filter(b=>b.mapping.routes.some(r=>r.application===application));
    // Candidate CSS inspection reuses the shared proposal; no second transformation inventory.
    if(options.contextRoot&&options.contextRoot!==root){
      const {proposeTransformation}=await import('./transformations.js');
      // Each file is read and parsed once per configuration write, not once per binding; findings are looked up by id.
      const findingById=new Map(report.findings.map(f=>[f.id,f]));const texts=new Map<string,Promise<string>>();const parsed=new Map<string,Promise<ReturnType<typeof postcss.parse>>>();
      const contextText=(path:string)=>{let t=texts.get('context\0'+path);if(!t)texts.set('context\0'+path,t=readFile(join(options.contextRoot!,path),'utf8'));return t;};
      const rootAst=(path:string)=>{let t=parsed.get(path);if(!t)parsed.set(path,t=readFile(join(root,path),'utf8').then(text=>postcss.parse(text)));return t;};
      for(const binding of bindings){const f=findingById.get(binding.finding.id)!;
        if(!binding.mapping.configured||!binding.mapping.css)continue;
        try{
          const proposal=proposeTransformation(f,await contextText(f.path));
          const replacement=postcss.parse('.probe{'+proposal.patch.replacement+'}').first;
          const declarations=replacement?.type==='rule'?replacement.nodes.filter(isDeclaration):[];
          const declaration=declarations[0];
          if(!declaration)continue;
          const actual=await rootAst(f.path);
          let present=false;
          actual.walkRules(r=>{
            if(r.selector===binding.mapping.sourceSelector&&declarations.every(expected=>r.nodes.filter(isDeclaration).some(d=>d.prop===expected.prop&&d.value===expected.value&&d.important===expected.important)))present=true;
          });
          if(present)binding.mapping.css={...binding.mapping.css,property:declaration.prop,value:declaration.value};
        }catch{/* Target binding remains independent of transformation eligibility. */}
      }
    }

  }
  const statePath = join(directory, runtimeConfigName(application) + '.state.json');
  const stateModulePath = fileURLToPath(new URL('./preview-runtime-state.js', import.meta.url));
  const contents = `import { mergeConfig } from 'vite';
import base from ${JSON.stringify('../'+viteConfig)};
import { installRuntimeState, runtimeStateTags } from ${JSON.stringify(stateModulePath)};
const statePath = ${JSON.stringify(statePath)};
export default mergeConfig(base, {
  cacheDir:${JSON.stringify(join(root,'.rtl-vite-cache',identity.role,application))},
  esbuild:{target:'esnext'},
  plugins: [{name:'rtl-local-preview',apply:'serve',enforce:'pre',
    transform(source,id){
      const path=id.split('?')[0].replaceAll('\\\\','/');
      if(${JSON.stringify(dataAdapter==='atlas')}&&path.endsWith('/libs/shared/src/index.ts')&&path.startsWith(${JSON.stringify(runtimeIdentity.projectRoot + '/')})){
        if(!source.includes('const storageKey = \"atlas-invoices-v1\";'))throw Error('PREVIEW_STORAGE_BINDING_UNAVAILABLE');
        return source.replace('const storageKey = \"atlas-invoices-v1\";', 'const storageKey = (window as any).__rtlPreviewStorageKey || \"atlas-invoices-v1\";') + '\\n;(window as any).__rtlPreviewSeedInvoices = seedInvoices;';
      }
      if(path===${JSON.stringify(join(runtimeIdentity.projectRoot,entry))})return 'await (window.__rtlPreviewDataReady || Promise.resolve());\\n'+source;
    },
    configureServer(server){installRuntimeState(server,statePath);},
    transformIndexHtml(){return runtimeStateTags(statePath);}
  }],
  server:{headers:{'Content-Security-Policy':${JSON.stringify('frame-ancestors ' + DASHBOARD_ORIGIN)}}}
});
`;
  const config = join(directory, runtimeConfigName(application));
  await writeRuntimeState(statePath, { identity: runtimeIdentity as unknown as Record<string, unknown>, sourceHashes, bindings, dataAdapter, readySelector: configured?.readySelector ?? '#root > *', dashboardOrigin: DASHBOARD_ORIGIN });
  // Identity reconciliation is idempotent; unchanged descriptors must not restart Vite.
  if(await readFile(config,'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error})!==contents)await writeFile(config, contents, 'utf8');
  return config;
}
