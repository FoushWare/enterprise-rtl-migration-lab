import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {pathToFileURL,fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const asset=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=process.env.SCANNER_ROOT||path.resolve(asset,'../../..','enterprise-rtl-migration-lab-latest');
const sha=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const modules=['cli','scan','css','html','typescript','rules','model','policy','policy-audit','coverage','report'];
const sources=Object.fromEntries(modules.map(n=>{const p=`tools/rtl-scanner/src/${n}.ts`;const s=fs.readFileSync(path.join(root,p),'utf8');return [p,{sha256:createHash('sha256').update(s).digest('hex'),source:s}]}));
const source='.btn {\n  margin-left: 20px;\n}\n';
// Bundle current TS modules into this asset; never depend on stale dist output.
const esbuild=await import('esbuild');const entry=path.join(asset,'references/verification-entry.ts');
fs.writeFileSync(entry,`export {extractCss} from ${JSON.stringify(path.join(root,'tools/rtl-scanner/src/css.ts'))};\nexport {detect} from ${JSON.stringify(path.join(root,'tools/rtl-scanner/src/rules.ts'))};\nexport {emptyPolicy} from ${JSON.stringify(path.join(root,'tools/rtl-scanner/src/policy.ts'))};\n`);
await esbuild.build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',packages:'external',outfile:path.join(asset,'references/verified-scanner.mjs'),logLevel:'silent'});
const {extractCss,detect,emptyPolicy}=await import(pathToFileURL(path.join(asset,'references/verified-scanner.mjs')));
const parsed=extractCss('button.css',source);const diagnostics=[...parsed.diagnostics];const findings=detect(parsed.evidence,new Map([['button.css',source]]),emptyPolicy,diagnostics);
if(findings[0]?.category!=='MANUAL_REVIEW'||findings[0]?.suggestion!==null)throw Error('Fixture assumptions changed');
fs.writeFileSync(path.join(asset,'references/verified-source.json'),JSON.stringify({repository:'FoushWare/enterprise-rtl-migration-lab',sha,fixture:{source,...parsed,findings,diagnostics},sources},null,2));
console.log(JSON.stringify({sha,fixture:findings.map(f=>({ruleId:f.ruleId,category:f.category,severity:f.severity,confidence:f.confidence,ownership:f.ownership,suggestion:f.suggestion}))},null,2));
