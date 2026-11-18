import type { Finding } from './model.js';
import { proposeBidiIsolation, BIDI_TRANSFORMATION_ID } from './codemod.js';
import { proposeCssSpacing, CSS_SPACING_TRANSFORMATION_ID } from './css-spacing.js';
import { proposeCssDirectional, CSS_DIRECTIONAL_TRANSFORMATION_ID } from './css-directional.js';
import { proposeReactInline, REACT_INLINE_TRANSFORMATION_ID } from './react-inline.js';
import { proposeCssIcon, CSS_ICON_TRANSFORMATION_ID } from './css-icons.js';

/** Shared dispatch for code review, eligibility and both persisted workflows. */
export const transformations=[
  {key:'RTL.BIDI.ISOLATION:direct-text',id:BIDI_TRANSFORMATION_ID,ruleId:'RTL.BIDI.ISOLATION',matches:(f:Finding)=>f.ruleId==='RTL.BIDI.ISOLATION',propose:proposeBidiIsolation},
  {key:'RTL.CSS.PHYSICAL:spacing',id:CSS_SPACING_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>f.ruleId==='RTL.CSS.PHYSICAL'&&f.sourceMechanism==='css'&&/^(margin|padding)-/.test(f.original),propose:proposeCssSpacing},
  {key:'RTL.CSS.PHYSICAL:logical',id:CSS_DIRECTIONAL_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(f.ruleId)&&f.sourceMechanism==='css',propose:proposeCssDirectional},
  {key:'RTL.CSS.PHYSICAL:react-inline',id:REACT_INLINE_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(f.ruleId)&&f.sourceMechanism==='react-inline',propose:proposeReactInline},
  {key:'RTL.ICON.PROGRESSION:css-opt-in',id:CSS_ICON_TRANSFORMATION_ID,ruleId:'RTL.ICON.PROGRESSION',matches:(f:Finding)=>f.ruleId==='RTL.ICON.PROGRESSION',propose:proposeCssIcon},
] as const;
export function transformationFor(finding:Finding){return transformations.find(t=>t.matches(finding));}
export function proposeTransformation(finding:Finding,source:string){
 const strategy=transformationFor(finding);
 if(!strategy)throw Error(finding.ruleId==='RTL.UTILITY.PHYSICAL'?'UTILITY_COMPILER_VERSION_AND_VARIANT_REVIEW_REQUIRED':finding.sourceMechanism==='emotion-template'||finding.sourceMechanism==='mui-sx'||finding.sourceMechanism==='mui-theme'?'CSS_IN_JS_OWNER_AND_RTL_PROCESSOR_REVIEW_REQUIRED':'UNSUPPORTED_TRANSFORMATION_FAMILY');
 return strategy.propose(finding,source);
}
