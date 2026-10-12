import { it,expect } from 'vitest';
import { mkdtemp,mkdir,writeFile,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from '../src/scan.js';
import { json,markdown } from '../src/report.js';
import { exitCode } from '../src/coverage.js';
it('Atlas actual inventory maps reference evidence without approving transformations',async()=>{
 const a=await scan(process.cwd()),b=await scan(process.cwd());const prepared = a.evidence.filter(e=>e.path==='libs/design-system/src/runtime.tsx'&&e.context.startsWith('rtlTheme/'));
 const expectedPrepared = [
  [
    "9a594b91eb9e5b9b4c785e5d610818690118b67a765d041edfc64a330ce3c0eb",
    "rtlTheme/styleOverrides/root",
    "padding",
    "\"10px 18px\""
  ],
  [
    "a48581f39558ed46458dedf7a0754d46b115744a4576fe5eb915ba85d664aa9e",
    "rtlTheme/styleOverrides/root",
    "borderColor",
    "\"#edf0f5\""
  ],
  [
    "956dbec8395fe4fab29df73ae86d519b1ee0ebc0c4374e0b02c03691a0e04781",
    "rtlTheme/styleOverrides/root",
    "padding",
    "\"17px 20px\""
  ],
  [
    "1a4c87cb4eb1909dc3804ea10069730131dcf1e0a5311b4dd1e8317a27f4bedc",
    "rtlTheme/styleOverrides/head",
    "fontSize",
    "11"
  ],
  [
    "5531274823f03e7459808f91f9362818b8c2c38eeb45d88b65d3e63d89f68972",
    "rtlTheme/styleOverrides/head",
    "fontWeight",
    "700"
  ],
  [
    "d7b4537bbcac3c815b21ceb7fbfb440699e37203a1c6d46017a87d5a1aebd5e3",
    "rtlTheme/styleOverrides/head",
    "color",
    "\"#80889a\""
  ],
  [
    "6cd70ca50f346593c75c612a803a595da001aaa6e63f53b4b1de8c48a6dc5cd7",
    "rtlTheme/styleOverrides/head",
    "letterSpacing",
    "\".6px\""
  ],
  [
    "25f99f547bb86932344f18c5e675c1f5622689eaeeb495207ec2b28ded3b073b",
    "rtlTheme/styleOverrides/head",
    "background",
    "\"#fafbfc\""
  ]
];
 expect(prepared.map(e=>[e.id,e.context,e.property,e.value])).toEqual(expectedPrepared);
 const relocated=a.evidence.filter(e=>e.path==='libs/design-system/src/runtime.tsx'&&e.context.startsWith('theme/'));
 expect(relocated.map(e=>[e.context.replace('theme/','rtlTheme/'),e.property,e.value,e.original,e.semantics])).toEqual(prepared.map(e=>[e.context,e.property,e.value,e.original,e.semantics]));
 expect(a.evidence.filter(e=>!prepared.includes(e))).toHaveLength(419);
expect(a.complete).toBe(true);expect(a.diagnostics).toHaveLength(9);expect(a.diagnostics.every(d=>d.blocking===false)).toBe(true);expect(a.findings.filter(f=>f.category==='AUTO_CANDIDATE')).toEqual([]);expect(new Set(a.findings.flatMap(f=>f.issueIds))).toEqual(new Set(['RTL-01','RTL-02','RTL-03','RTL-04','RTL-05','RTL-06','RTL-07','RTL-08','RTL-09']));expect(json(a)).toBe(json(b));expect(markdown(a)).toBe(markdown(b));
 for(const f of a.findings){const s=await readFile(f.path,'utf8');expect(s.slice(f.range.start.offset,f.range.end.offset)).toBe(f.original);expect(f.rationale.length).toBeGreaterThan(0);expect(f.treatment.length).toBeGreaterThan(0);expect(f.suggestion).toBeNull();}
});
it('temporary Nx directional unsupported input cannot report complete',async()=>{const root=await mkdtemp(join(tmpdir(),'atlas-detection-'));try{await mkdir(join(root,'apps/x/src'),{recursive:true});await mkdir(join(root,'libs'));await writeFile(join(root,'apps/x/project.json'),'{"sourceRoot":"apps/x/src"}');await writeFile(join(root,'apps/x/index.html'),'<html dir="ltr"></html>');await writeFile(join(root,'apps/x/src/test.tsx'),'<div style={{left:dynamic}}/>;');const a=await scan(root);expect(a.complete).toBe(false);expect(exitCode(a.complete,a.findings.length,false)).toBe(2);await writeFile(join(root,'apps/x/src/test.tsx'),'<div style={{color:dynamic}}/>;');const b=await scan(root);expect(b.complete).toBe(true);expect(exitCode(b.complete,b.findings.length,false)).toBe(0);}finally{await rm(root,{recursive:true,force:true});}});
it('invalid policy fails explicitly rather than executing or ignoring config',async()=>{const root=await mkdtemp(join(tmpdir(),'atlas-policy-'));try{await mkdir(join(root,'apps'));await mkdir(join(root,'libs'));await writeFile(join(root,'rtl-scanner.config.json'),'{"schemaVersion":99}');await expect(scan(root)).rejects.toThrow('Invalid scanner policy');}finally{await rm(root,{recursive:true,force:true});}});
