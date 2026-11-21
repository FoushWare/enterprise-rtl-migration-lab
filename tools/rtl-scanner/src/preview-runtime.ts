import { mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { scan } from './scan.js';
import { type ContextMapping, type PreviewApplication } from './example-preview-mappings.js';
import { contextualBridgeSource } from './contextual-preview-bridge.js';
import {loadPreviewConfiguration,configuredMapping,runtimeConfigName,previewFile} from './preview-configuration.js';
import postcss from 'postcss';
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
      for(const binding of bindings){const f=report.findings.find(f=>f.id===binding.finding.id)!;
        if(!binding.mapping.configured||!binding.mapping.css)continue;
        try{
          const proposal=proposeTransformation(f,await readFile(join(options.contextRoot,f.path),'utf8'));
          const replacement=postcss.parse('.probe{'+proposal.patch.replacement+'}').first;
          const declarations=replacement?.type==='rule'?replacement.nodes.filter(d=>d.type==='decl'):[];
          const declaration=declarations[0];
          if(!declaration)continue;
          const actual=postcss.parse(await readFile(join(root,f.path),'utf8'));
          let present=false;
          actual.walkRules(r=>{
            if(r.selector===binding.mapping.sourceSelector&&declarations.every(expected=>r.nodes.some(d=>d.type==='decl'&&d.prop===expected.prop&&d.value===expected.value&&d.important===expected.important)))present=true;
          });
          if(present)binding.mapping.css={...binding.mapping.css,property:declaration.prop,value:declaration.value};
        }catch{/* Target binding remains independent of transformation eligibility. */}
      }
    }

  }
  const bridge = `(()=>{
    const identity=${scriptJson(runtimeIdentity)},dashboardOrigin=${scriptJson(DASHBOARD_ORIGIN)};
    window.addEventListener('message',event=>{
      const request=event.data;
      if(event.origin!==dashboardOrigin||event.source!==window.parent||!request||request.type!=='rtl-preview-probe'||request.version!==1||typeof request.nonce!=='string'||request.nonce.length>100||request.role!==identity.role||typeof request.findingId!=='string'||!/^RTL\\.BIDI\\.ISOLATION:[a-f0-9]{24,64}$/.test(request.findingId)||request.sourcePath!=='apps/invoicing/src/components/InvoiceTable.tsx'||request.expectedSha256!==identity.sourceSha256||request.runtimeSessionId!==identity.sessionId||typeof request.sessionId!=='string')return;
      if(request.projectRoot!==undefined&&request.projectRoot!==identity.projectRoot)return;
      const links=[...document.querySelectorAll('.invoice-link')];
      const invoiceIds=links.map(link=>link.textContent.trim());
      const bdiCount=document.querySelectorAll('.invoice-link bdi[dir="auto"]').length;
      const rendered=location.pathname==='/invoices'&&links.length>0&&links.every(link=>link.getBoundingClientRect().width>0)&&getComputedStyle(links[0]).color!=='rgb(0, 0, 0)';
      window.parent.postMessage({type:'rtl-preview-status',version:1,nonce:request.nonce,role:identity.role,sessionId:request.sessionId,runtimeSessionId:identity.sessionId,projectRoot:identity.projectRoot,findingId:request.findingId,sourcePath:request.sourcePath,sourceSha256:identity.sourceSha256,rendered,dir:document.documentElement.dir,route:location.pathname,invoiceIds,bdiCount,fixtureData:'atlas-seed-v1'},dashboardOrigin);
    });
  })();` + contextualBridgeSource + '\ninstallContextPreview(' + scriptJson({identity:runtimeIdentity,dashboardOrigin:DASHBOARD_ORIGIN,sourceHashes,bindings,dataAdapter,readySelector:configured?.readySelector??'#root > *'}) + ');';
  const contents = `import { mergeConfig } from 'vite';
import base from ${JSON.stringify('../'+viteConfig)};
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
    configureServer(server){server.middlewares.use('/__rtl_preview_identity',(_request,response)=>{response.setHeader('Content-Type','application/json');response.setHeader('Cache-Control','no-store');response.end(${JSON.stringify(JSON.stringify({...runtimeIdentity,contextVersion:2,sourceHashes}))});});},
    transformIndexHtml(){return [{tag:'script',children:${JSON.stringify(bridge)},injectTo:'head-prepend'}];}
  }],
  server:{headers:{'Content-Security-Policy':${JSON.stringify('frame-ancestors ' + DASHBOARD_ORIGIN)}}}
});
`;
  const config = join(directory, runtimeConfigName(application));
  // Identity reconciliation is idempotent; unchanged descriptors must not restart Vite.
  if(await readFile(config,'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error})!==contents)await writeFile(config, contents, 'utf8');
  return config;
}
