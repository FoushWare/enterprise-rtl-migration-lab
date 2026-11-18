import {it,expect} from 'vitest';
import {extractCss} from '../src/css.js';
import {extractTypescript} from '../src/typescript.js';
import {detect} from '../src/rules.js';
import {emptyPolicy} from '../src/policy.js';
import {proposeTransformation} from '../src/transformations.js';
import {composeWorkflowFile} from '../src/review-workflow.js';
const css='libs/unrelated/src/edges.css',tsx='apps/unknown/src/AnyName.tsx';
const findings=(source:string,path=css)=>detect((path===css?extractCss(path,source):extractTypescript(path,source)).evidence,new Map([[path,source]]),{...emptyPolicy,ownership:{css:'custom-css','react-inline':'custom-inline'}},[]);
const propose=(source:string,path=css)=>findings(source,path).filter(f=>['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE','RTL.BIDI.ISOLATION','RTL.ICON.PROGRESSION'].includes(f.ruleId)).map(f=>proposeTransformation(f,source));
for(const [before,after] of [
 ['.a{text-align : left !important;}','.a{text-align : start !important;}'],
 ['.a{text-align:right /* retain */;}','.a{text-align:end /* retain */;}'],
 ['.a{position:absolute;left:12px;right:3rem;}','.a{position:absolute;inset-inline-start:12px;inset-inline-end:3rem;}'],
 ['.a{border-left:2px solid red;border-right-width:3px;}','.a{border-inline-start:2px solid red;border-inline-end-width:3px;}'],
 ['.a{border-top-left-radius:4px 8px;border-bottom-right-radius:2rem;}','.a{border-start-start-radius:4px 8px;border-end-end-radius:2rem;}'],
 ['.a{border-left-color:#ff0033!important; border-right-style:dotted;}','.a{border-inline-start-color:#ff0033!important; border-inline-end-style:dotted;}'],
] as const)it('structural rename '+before,()=>{const proposals=propose(before);expect(proposals.length).toBeGreaterThan(0);expect(composeWorkflowFile(before,proposals.map(p=>p.patch))).toBe(after);expect(findings(after)).toHaveLength(0);expect(()=>proposeTransformation(findings(before)[0],after)).toThrow()});
for(const source of [
 '.a{text-align:left;text-align:right}', '.a{left:12px}', '.a{position:relative;left:12px}', '.a{position:absolute;left:12px;inset:0}', '.a{position:fixed;right:2px;inset-inline-start:0}', '.a{position:absolute;left:2px;transform:translateX(2px)}', '.a{border:1px solid red;border-left:2px solid blue}', '.a{border-left:2px solid red;border-left-width:3px}', '.a{border-radius:2px;border-top-left-radius:3px}', '.a{border-top-left-radius:var(--corner)}', '.a{text-align:left}.a:hover{color:red}', '.a{direction:rtl;text-align:left}', '.a{/*rtl-physical: deliberate*/border-left-color:red}', '@media(width>1px){.a{text-align:left}}', '.a{border-left-color:rgb(1,2,3)}',
])it('actionable CSS blocker '+source,()=>{const f=findings(source).find(f=>['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(f.ruleId))!;expect(()=>proposeTransformation(f,source)).toThrow(/CSS_DIRECTIONAL_/)});
it('supports direct React literal styles without losing comments, quote style or React numeric units',()=>{
 const before=`export const X=()=> <div style={{marginLeft:12, paddingRight: '3rem', textAlign: 'right', /*keep*/ borderTopLeftRadius:4}} />`;
 const after=composeWorkflowFile(before,propose(before,tsx).map(p=>p.patch));expect(after).toBe(`export const X=()=> <div style={{marginInlineStart:12, paddingInlineEnd: '3rem', textAlign: 'end', /*keep*/ borderStartStartRadius:4}} />`);expect(findings(after,tsx)).toHaveLength(0);
 const positioned=`const X=()=> <span style={{position:'absolute',left:-12,borderRight:'2px solid red'}}/>`;expect(composeWorkflowFile(positioned,propose(positioned,tsx).map(p=>p.patch))).toContain("insetInlineStart:-12,borderInlineEnd:'2px solid red'");
});
for(const object of ["{...extra,marginLeft:2}","{margin:2,marginLeft:3}","{marginLeft:'12'}","{left:12}","{marginLeft:2,paddingRight:value}","{direction:'rtl',marginLeft:2}","{borderLeft:'2px solid red',borderInlineEnd:'3px solid blue'}"]){const source='const X=()=> <div style={'+object+'}/>';it('blocks unsafe inline '+object,()=>expect(()=>propose(source,tsx)).toThrow(/REACT_INLINE_/))}
it('does not transform shared objects, custom components or framework-owned styles',()=>{
 for(const source of ["const s={marginLeft:2};const X=()=> <div style={s}/>","const X=()=> <Unknown style={{marginLeft:2}}/>"]){expect(()=>propose(source,tsx)).toThrow(/REACT_INLINE_/)}
});
it('extends direct bidi text sinks while preserving canonical text and rejecting existing isolation/direction ancestors',()=>{
 const before='const X=()=> <p>قبل ({person.name}) / {person.email} / {person.address} / {person.id}</p>';
 const after=composeWorkflowFile(before,propose(before,tsx).map(p=>p.patch));expect(after.match(/<bdi dir="auto">/g)).toHaveLength(4);expect(after).toContain('قبل (<bdi dir="auto">{person.name}</bdi>)');expect(findings(after,tsx)).toHaveLength(0);
 for(const tag of ['<bdo dir="rtl">','<p dir="auto">','<p style={{unicodeBidi:"isolate"}}>'])expect(findings('const X=()=> '+tag+'{person.email}</'+(tag.startsWith('<bdo')?'bdo':'p')+'>',tsx)).toHaveLength(0);
 for(const tag of ['<p dir="rtl">','<p dir={direction}>','<p {...props}>'])expect(()=>propose('const X=()=> '+tag+'{person.email}</p>',tsx)).toThrow('ALREADY_ISOLATED');
 for(const source of ['<textarea>{person.name}</textarea>','<Unknown>{person.email}</Unknown>','<svg><text>{person.id}</text></svg>'])expect(()=>propose(source,tsx)).toThrow();
});
it('mirrors only an explicitly marked progression icon and is idempotent without touching unmarked icons',()=>{
 const before='.next { /* rtl-icon: progression-right */ display: inline-block; width:20px; }\r\n.brand {display:inline-block}';const proposals=propose(before);expect(proposals).toHaveLength(1);const after=composeWorkflowFile(before,proposals.map(p=>p.patch));expect(after).toContain('\r\n.next:dir(rtl) { scale: -1 1; }');expect(after).toContain('.brand {display:inline-block}');expect(findings(after)).toHaveLength(0);
 for(const extra of ['transform:rotate(3deg);','scale:-1;','animation:spin 1s;','direction:rtl;'])expect(()=>propose(before.replace('width:20px;',extra))).toThrow(/CSS_ICON_/);
 expect(findings('.next{display:inline-block}')).toHaveLength(0);
});
it('reports physical utility classes without inventing a framework/compiler transformation',()=>{const source='const X=()=> <div className="md:ml-4 text-right rounded-tl-lg"/>';const fs=findings(source,tsx);expect(fs.map(f=>f.ruleId)).toEqual(['RTL.UTILITY.PHYSICAL']);expect(()=>proposeTransformation(fs[0],source)).toThrow('UTILITY_COMPILER_VERSION');expect(findings('const X=()=> <div className="ms-4 text-start rounded-ss-lg"/>',tsx)).toHaveLength(0)});

it('never promotes an intentional-content exception into a bidi patch',()=>{const source='const X=()=> <p>{person.email}</p>',f=findings(source,tsx)[0];expect(()=>proposeTransformation({...f,exceptionReason:'Reviewed physical reading contract',category:'INTENTIONAL_LTR'},source)).toThrow('INTENTIONAL_CONTENT_REQUIRES_REVIEW')});
