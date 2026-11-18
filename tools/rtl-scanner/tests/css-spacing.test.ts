import { it,expect } from 'vitest';
import { extractCss } from '../src/css.js';
import { detect } from '../src/rules.js';
import { emptyPolicy } from '../src/policy.js';
import { proposeTransformation } from '../src/transformations.js';
import { composeWorkflowFile,ReviewWorkflowStore } from '../src/review-workflow.js';
import { ControlledApplyService,ApplyAuditStore } from '../src/controlled-apply.js';
import { scan } from '../src/scan.js';
import { mkdtemp,mkdir,writeFile,readFile,rm,realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const path='libs/any-name/src/spacing.css';
const findings=(source:string)=>detect(extractCss(path,source).evidence,new Map([[path,source]]),{...emptyPolicy,ownership:{css:'custom-css'}},[]);
it('renames exact parsed properties preserving values, comments, CRLF, !important and other declarations; second scan is idempotent',()=>{
 const source='.one { margin-left : 12px !important; padding-right: 3rem; color: red; }\r\n.two{margin-right:-2px}';
 const proposals=findings(source).map(f=>proposeTransformation(f,source));expect(proposals.every(p=>p.transformationId==='css-spacing-logical')).toBe(true);
 const after=composeWorkflowFile(source,proposals.map(p=>p.patch));expect(after).toBe('.one { margin-inline-start : 12px !important; padding-inline-end: 3rem; color: red; }\r\n.two{margin-inline-end:-2px}');expect(findings(after)).toHaveLength(0);
 expect(()=>proposeTransformation(findings(source)[0],after)).toThrow();
});
for(const [source,reason] of [
 ['.one{margin:1px;margin-left:2px}','CASCADE_DECLARATION'],
 ['.one{padding-left:2px;padding-inline-end:3px}','CASCADE_DECLARATION'],
 ['.one{margin-left:2px;margin-left:3px}','CASCADE_DECLARATION'],
 ['.one{margin-left:2px}.one{margin-right:3px}','CASCADE_SELECTOR'],
 ['.one{ /* rtl-physical: map coordinates */ margin-left:2px}','INTENTIONAL_PHYSICAL'],
 ['.one{direction:rtl;margin-left:2px}','DIRECTION_OR_WRITING_MODE'],
 ['.one{DIRECTION:rtl;margin-left:2px}','DIRECTION_OR_WRITING_MODE'],
 ['.one{MARGIN-INLINE-START:3px;margin-left:2px}','CASCADE_DECLARATION'],
 ['.one{writing-mode:vertical-rl;margin-left:2px}','DIRECTION_OR_WRITING_MODE'],
 ['@media(min-width:400px){.one{margin-left:2px}}','NESTED_OR_CONDITIONAL'],
 ['.one{margin-left:var(--gap)}','UNSUPPORTED_VALUE'],
 ['.one{padding-left:/* comment */ -2px}','UNSUPPORTED_VALUE'],
 ['.one{padding-right:auto}','UNSUPPORTED_VALUE'],
 ['.one{margin-left:12}','UNITLESS_LENGTH'],
 ['.one{@apply custom; margin-left:2px}','UNSUPPORTED_RULE_CONTENT'],
 ['.one:hover{margin-left:2px}','SIMPLE_CLASS'],
 ['.one{position:absolute;margin-left:2px}','CASCADE_DECLARATION'],
] as const)it('skips '+reason+' '+source,()=>{const f=findings(source).find(f=>f.ruleId==='RTL.CSS.PHYSICAL')!;expect(()=>proposeTransformation(f,source)).toThrow(reason)});
it('both workflow modes compose portable CSS-only candidates in a separate minimal Nx-compatible project without Atlas or preview mappings',async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'rtl-spacing-portable-')));const candidates:string[]=[];
 try{
 await mkdir(join(root,'apps'),{recursive:true});await mkdir(join(root,'libs/any-name/src'),{recursive:true});await writeFile(join(root,'libs/any-name/project.json'),JSON.stringify({sourceRoot:'libs/any-name/src'}));
 const source='.a{margin-left:12px;padding-right:4px}.b{margin-right:8px}';await writeFile(join(root,path),source);
 for(const name of ['nx.json','package.json','tsconfig.json'])await writeFile(join(root,name),'{}');await writeFile(join(root,'rtl-scanner.config.json'),JSON.stringify({...emptyPolicy,ownership:{css:'custom-css'}}));
 const report=await scan(root),store=new ReviewWorkflowStore(root,join(root,'state/workflows.json'),new ControlledApplyService(root,new ApplyAuditStore(join(root,'state/audit.json')),join(root,'state/backups')));
 for(const mode of ['one-by-one','apply-first'] as const){const w=await store.begin({...report,mode});expect(w.entries.filter(e=>e.patch)).toHaveLength(3);const [a,b,c]=w.entries;
 if(mode==='one-by-one')for(const e of w.entries)await store.change(w.id,e.finding.id,{action:'apply'});
 candidates.push(w.session!.candidateRoot);expect(w.session!.sourcePath).toBe(path);
 await store.change(w.id,a.finding.id,{action:'Accepted'});await store.change(w.id,b.finding.id,{action:'Rejected'});await store.change(w.id,c.finding.id,{action:'Deferred'});
 expect(await readFile(join(w.session!.candidateRoot,path),'utf8')).toBe('.a{margin-inline-start:12px;padding-right:4px}.b{margin-right:8px}');expect(await readFile(join(root,path),'utf8')).toBe(source);
 const restored=new ReviewWorkflowStore(root,store.path,new ControlledApplyService(root));await restored.load();expect(restored.get(w.id).entries.map(e=>e.decision)).toEqual(['Accepted','Rejected','Deferred']);
 await store.validate(w.id);expect(w.validation?.state).toBe('Unavailable');expect(w.validation?.checks.some(c=>c.name==='runtime'&&c.state==='Unavailable')).toBe(true);await expect(store.apply(w.id,'APPLY_CONFIRMED')).rejects.toThrow('VALIDATED_ACCEPTED_CANDIDATE_REQUIRED');
 }
 }finally{for(const candidate of candidates)await rm(candidate,{recursive:true,force:true});await rm(root,{recursive:true,force:true})}
});
