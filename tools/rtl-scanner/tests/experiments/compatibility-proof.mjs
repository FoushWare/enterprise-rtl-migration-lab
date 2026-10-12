// Run manually with an isolated installation. No package installation or server startup here.
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const isolated = resolve(process.argv[2]);
assert.ok(isolated !== process.cwd() && !isolated.startsWith(process.cwd()+'/'), 'Experiment outputs must be outside the repository');
const requireIsolated = createRequire(join(isolated,'package.json'));
for (const [name,version] of Object.entries({'@mui/material':'7.3.11','@emotion/react':'11.14.0','@emotion/cache':'11.14.0','@emotion/styled':'11.14.1','stylis':'4.2.0','@mui/stylis-plugin-rtl':'7.3.10','react':'19.3.0','react-dom':'19.3.0'})) assert.equal(requireIsolated(name+'/package.json').version,version);
const {compile,serialize,middleware,prefixer,stringify}=requireIsolated('stylis');
const cjsPlugin=requireIsolated('@mui/stylis-plugin-rtl').default;
const esmPlugin=(await import(pathToFileURL(join(isolated,'node_modules/@mui/stylis-plugin-rtl/esm/index.js')))).default;
assert.equal(typeof cjsPlugin,'function');assert.equal(typeof esmPlugin,'function');
const meta=JSON.parse(await readFile(join(isolated,'plugin-metadata.json'),'utf8'));
const tar=await fetch(meta.dist.tarball);assert.equal(tar.ok,true);
const tarBytes=Buffer.from(await tar.arrayBuffer());
assert.equal('sha512-'+createHash('sha512').update(tarBytes).digest('base64'),meta.dist.integrity);
assert.equal(createHash('sha1').update(tarBytes).digest('hex'),meta.dist.shasum);
const output=(css,plugins)=>serialize(compile(css),middleware([...plugins,stringify]));
const cases=[
 ['physical','.x{left:0;right:2px;border-right:1px solid red;transform:translateX(-100%)}'],
 ['logical','.x{margin-inline-end:6px;padding-inline-start:7px;inset-inline-start:0}'],
 ['excluded','.x{/* @noflip */ left:0;/* @noflip */ border-right:1px solid red;/* @noflip */ transform:translateX(-100%)}'],
 ['nested','.x{left:0;@media(max-width:900px){/* @noflip */ transform:translateX(-100%);&.is-open{/* @noflip */ transform:translateX(0)}}}'],
 ['prefix','.x{display:flex;user-select:none}'],
];
const results=cases.map(([name,css])=>({name,input:css,ltr:output(css,[prefixer]),rtl:output(css,[prefixer,esmPlugin])}));
assert.match(results[0].rtl,/right:0/);assert.match(results[0].rtl,/border-left/);assert.match(results[0].rtl,/translateX\(100%\)/);
assert.equal(results[1].ltr,results[1].rtl);
assert.equal(results[2].ltr,results[2].rtl);
assert.match(results[3].rtl,/translateX\(-100%\)/);assert.match(results[3].rtl,/\.x\.is-open/);
const {build}=requireIsolated('esbuild');
// Reuse only the already installed project browser driver; bundle runtime packages resolve in temp.
const {chromium}=createRequire(join(process.cwd(),'package.json'))('@playwright/test');
const browser=await chromium.launch({channel:'chromium',headless:true});
const browserResults=[];
try {
 await copyFile('tools/rtl-scanner/tests/experiments/runtime-fixture.jsx',join(isolated,'fixture.jsx'));
 for(const mode of ['development','production']) {
  const bundle=join(isolated,mode+'.js');
  await build({entryPoints:[join(isolated,'fixture.jsx')],outfile:bundle,bundle:true,platform:'browser',format:'iife',minify:mode==='production',define:{'process.env.NODE_ENV':JSON.stringify(mode)},logLevel:'silent'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setContent('<html><head><style>.app-main{margin-left:238px}@media(max-width:900px){.app-main{margin-left:0}}@media print{aside{display:none!important}.app-main{margin-left:0}}</style></head><body><div id="root"></div></body></html>');
  await page.addScriptTag({content:await readFile(bundle,'utf8')});
  await page.waitForSelector('#preserved-input');
  await page.locator('#preserved-input').fill('saved across switches');
  await page.evaluate(()=>{window.inputNode=document.getElementById('preserved-input');});
  const state=()=>page.evaluate(()=>{
   const shell=document.getElementById('shell'),s=getComputedStyle(shell),input=document.getElementById('preserved-input');
   const rules=[...document.querySelectorAll('style[data-emotion]')].flatMap(n=>[...n.sheet.cssRules].map(r=>r.cssText));
   return {dir:document.documentElement.dir,themeDirection:window.fixtureThemeDirection,mounts:window.fixtureMounts,value:input.value,sameInput:input===window.inputNode,left:s.left,right:s.right,borderLeft:s.borderLeftWidth,borderRight:s.borderRightWidth,transform:s.transform,x:shell.getBoundingClientRect().x,gutter:getComputedStyle(document.getElementById('gutter')).marginLeft,tags:document.querySelectorAll('style[data-emotion]').length,rules:rules.length,uniqueRules:new Set(rules).size,portalDir:getComputedStyle(document.querySelector('[role=dialog]')).direction,inputClass:input.parentElement.className,globalLeft:getComputedStyle(document.body).borderLeftWidth,globalRight:getComputedStyle(document.body).borderRightWidth};
  });
  const change=async dir=>{await page.evaluate(d=>window.fixtureRender(d),dir);await page.waitForFunction(d=>document.documentElement.dir===d&&document.getElementById('preserved-input').parentElement.className.includes(d==='rtl'?'atlas-rtl-':'css-'),dir);};
  await change('rtl');await change('ltr');const warmed=await state();
  for(let i=0;i<5;i++)for(const dir of ['rtl','ltr']) {
   await change(dir);const snapshot=await state();
   assert.equal(snapshot.value,'saved across switches');assert.equal(snapshot.sameInput,true);assert.equal(snapshot.mounts,warmed.mounts);assert.equal(snapshot.portalDir,dir);assert.equal(snapshot.themeDirection,dir);
   assert.equal(snapshot.left,'0px');assert.equal(snapshot.borderRight,'1px');assert.equal(snapshot.borderLeft,'0px');assert.equal(snapshot.x,0);assert.equal(snapshot.gutter,'238px');
   assert.equal(snapshot.globalLeft,dir==='ltr'?'3px':'0px');assert.equal(snapshot.globalRight,dir==='rtl'?'3px':'0px');
   assert.equal(snapshot.rules,snapshot.uniqueRules);if(dir==='ltr'){assert.equal(snapshot.tags,warmed.tags);assert.equal(snapshot.rules,warmed.rules);}
  }
  const final=await state();const widths=[];
  for(const width of [899,900,901]){
   await page.setViewportSize({width,height:1000});await change('rtl');const closed=await state();
   assert.equal(closed.gutter,width<=900?'0px':'238px');assert.equal(closed.x,width<=900?-238:0);
   await page.evaluate(()=>window.fixtureRender('rtl',true));await page.waitForFunction(()=>document.getElementById('shell').classList.contains('is-open'));const open=await state();assert.equal(open.x,0);
   widths.push({width,closedX:closed.x,openX:open.x,gutter:closed.gutter});
  }
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('#shell').evaluate(n=>getComputedStyle(n).display),'none');assert.equal((await state()).gutter,'0px');
  await page.evaluate(()=>window.fixtureDispose());assert.equal(await page.locator('style[data-emotion$="-global"]').count(),0);
  assert.deepEqual(errors,[]);browserResults.push({mode,warmed,final,widths,print:true,globalCleanup:true,errors});await page.close();
 }
} finally {await browser.close();}
const lock=JSON.parse(await readFile(join(isolated,'package-lock.json'),'utf8'));
const packages=['@mui/material','@emotion/react','@emotion/cache','@emotion/styled','stylis','@mui/stylis-plugin-rtl','react','react-dom','esbuild'].map(name=>{const p=Object.entries(lock.packages).find(([path,p])=>path.endsWith('node_modules/'+name)&&!p.extraneous&&!p.link)?.[1];return {name,version:p?.version,integrity:p?.integrity};});
const report={node:process.version,chromium:browser.version(),plugin:meta,tarballIntegrityVerified:true,cjsImport:true,esmImport:true,packages,stylis:results,browser:browserResults};
await writeFile(join(isolated,'results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({integrity:true,stylisCases:results.length,browser:browserResults.map(r=>({mode:r.mode,cycles:5,mounts:r.final.mounts,tags:r.final.tags,rules:r.final.rules,widths:r.widths,print:r.print,globalCleanup:r.globalCleanup}))},null,2));
