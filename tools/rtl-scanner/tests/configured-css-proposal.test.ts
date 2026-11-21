import {describe, expect, it} from 'vitest';
import {extractCss} from '../src/css.js';
import {hash} from '../src/model.js';
import {detect} from '../src/rules.js';
import {emptyPolicy} from '../src/policy.js';
import {proposeTransformation} from '../src/transformations.js';

describe('configured stylesheet proposals',()=>{
 const path='design/widget.css';
 const context='stylesheet/.outer .widget';
 const source='.outer .widget{position:absolute;left:7px;bottom:4px}';
 function finding(css=source, sourceDigest=hash(source)){
  return detect(extractCss(path,css).evidence,new Map([[path,css]]),{
   ...emptyPolicy,ownership:{css:'custom-css'},
   cssProposals:[{path,context,property:'left',value:'7px',kind:'inline-edge',sourceDigest}],
  },[])[0];
 }
 it('patches an exact configured descendant and preserves neighboring declarations',()=>{
  const {patch}=proposeTransformation(finding(),source);
  expect(source.slice(0,patch.startOffset)+patch.replacement+source.slice(patch.endOffset))
   .toBe('.outer .widget{position:absolute;inset-inline-start:7px;bottom:4px}');
 });
 it('rejects stale source and conflicting insets',()=>{
  const css=source.replace('bottom:4px','inset:0');
  expect(()=>proposeTransformation(finding(css),css)).toThrow('CSS_INTENT_STALE_SOURCE');
  expect(()=>proposeTransformation(finding(css,hash(css)),css)).toThrow('CSS_INTENT_CONFLICTING_EDGE');
 });
});

it.each([['transform','translateX(-24%)'],['box-shadow','5px 0 7px #344']])('recognizes a complete direction-aware %s, but still reports an incomplete pair',(property,value)=>{
 const path='design/widget.css',context='stylesheet/.sheet',source=`.sheet{${property}:${value}}`;
 const policy={...emptyPolicy,ownership:{css:'custom-css'} as const,cssProposals:[{path,context,property,value,kind:'mirror-offset' as const,sourceDigest:hash(source)}]};
 const findings=(css:string)=>detect(extractCss(path,css).evidence,new Map([[path,css]]),policy,[]);
 const {patch}=proposeTransformation(findings(source)[0],source);
 const updated=source.slice(0,patch.startOffset)+patch.replacement+source.slice(patch.endOffset);
 expect(findings(updated)).toHaveLength(0);
 expect(findings(updated.replace(/&:dir\(rtl\) \{[^}]+\}/,''))).toHaveLength(1);
});
