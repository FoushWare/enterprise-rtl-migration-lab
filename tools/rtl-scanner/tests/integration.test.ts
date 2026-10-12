import { it,expect } from 'vitest';
import { mkdtemp,mkdir,writeFile,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from '../src/scan.js';
import { json,markdown } from '../src/report.js';
import { exitCode } from '../src/coverage.js';
it('Atlas actual inventory maps reference evidence without approving transformations',async()=>{
 const a=await scan(process.cwd()),b=await scan(process.cwd());expect(a.evidence).toHaveLength(419);expect(a.complete).toBe(true);expect(a.diagnostics).toHaveLength(9);expect(a.diagnostics.every(d=>d.blocking===false)).toBe(true);expect(a.findings.filter(f=>f.category==='AUTO_CANDIDATE')).toEqual([]);expect(new Set(a.findings.flatMap(f=>f.issueIds))).toEqual(new Set(['RTL-01','RTL-02','RTL-03','RTL-04','RTL-05','RTL-06','RTL-07','RTL-08','RTL-09']));expect(json(a)).toBe(json(b));expect(markdown(a)).toBe(markdown(b));
 for(const f of a.findings){const s=await readFile(f.path,'utf8');expect(s.slice(f.range.start.offset,f.range.end.offset)).toBe(f.original);expect(f.rationale.length).toBeGreaterThan(0);expect(f.treatment.length).toBeGreaterThan(0);expect(f.suggestion).toBeNull();}
});
it('temporary Nx directional unsupported input cannot report complete',async()=>{const root=await mkdtemp(join(tmpdir(),'atlas-detection-'));try{await mkdir(join(root,'apps/x/src'),{recursive:true});await mkdir(join(root,'libs'));await writeFile(join(root,'apps/x/project.json'),'{"sourceRoot":"apps/x/src"}');await writeFile(join(root,'apps/x/index.html'),'<html dir="ltr"></html>');await writeFile(join(root,'apps/x/src/test.tsx'),'<div style={{left:dynamic}}/>;');const a=await scan(root);expect(a.complete).toBe(false);expect(exitCode(a.complete,a.findings.length,false)).toBe(2);await writeFile(join(root,'apps/x/src/test.tsx'),'<div style={{color:dynamic}}/>;');const b=await scan(root);expect(b.complete).toBe(true);expect(exitCode(b.complete,b.findings.length,false)).toBe(0);}finally{await rm(root,{recursive:true,force:true});}});
it('invalid policy fails explicitly rather than executing or ignoring config',async()=>{const root=await mkdtemp(join(tmpdir(),'atlas-policy-'));try{await mkdir(join(root,'apps'));await mkdir(join(root,'libs'));await writeFile(join(root,'rtl-scanner.config.json'),'{"schemaVersion":99}');await expect(scan(root)).rejects.toThrow('Invalid scanner policy');}finally{await rm(root,{recursive:true,force:true});}});
