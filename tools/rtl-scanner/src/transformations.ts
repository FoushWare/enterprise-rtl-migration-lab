import type { Finding } from './model.js';
import type { PatchRequest } from './review-session.js';
import { proposeBidiIsolation, BIDI_TRANSFORMATION_ID } from './codemod.js';
import { proposeCssSpacing, CSS_SPACING_TRANSFORMATION_ID } from './css-spacing.js';
import { proposeCssDirectional, CSS_DIRECTIONAL_TRANSFORMATION_ID } from './css-directional.js';
import { proposeReactInline, REACT_INLINE_TRANSFORMATION_ID } from './react-inline.js';
import { proposeCssIcon, CSS_ICON_TRANSFORMATION_ID } from './css-icons.js';

import { CSS_CONFIGURED_TRANSFORMATION_ID, proposeConfiguredCss } from './css-configured-proposal.js';

/** Shared dispatch for code review, eligibility and both persisted workflows. */
export const transformations=[
  {key:'css:explicit-intent',id:CSS_CONFIGURED_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>!!f.cssProposal,propose:proposeConfiguredCss},
  {key:'RTL.BIDI.ISOLATION:direct-text',id:BIDI_TRANSFORMATION_ID,ruleId:'RTL.BIDI.ISOLATION',matches:(f:Finding)=>f.ruleId==='RTL.BIDI.ISOLATION',propose:proposeBidiIsolation},
  {key:'RTL.CSS.PHYSICAL:spacing',id:CSS_SPACING_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>f.ruleId==='RTL.CSS.PHYSICAL'&&f.sourceMechanism==='css'&&/^(margin|padding)-/.test(f.original),propose:proposeCssSpacing},
  {key:'RTL.CSS.PHYSICAL:logical',id:CSS_DIRECTIONAL_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(f.ruleId)&&f.sourceMechanism==='css',propose:proposeCssDirectional},
  {key:'RTL.CSS.PHYSICAL:react-inline',id:REACT_INLINE_TRANSFORMATION_ID,ruleId:'RTL.CSS.PHYSICAL',matches:(f:Finding)=>['RTL.CSS.PHYSICAL','RTL.GEOMETRY.EDGE'].includes(f.ruleId)&&f.sourceMechanism==='react-inline',propose:proposeReactInline},
  {key:'RTL.ICON.PROGRESSION:css-opt-in',id:CSS_ICON_TRANSFORMATION_ID,ruleId:'RTL.ICON.PROGRESSION',matches:(f:Finding)=>f.ruleId==='RTL.ICON.PROGRESSION',propose:proposeCssIcon},
] as const;
export function sameSupportedPatch(a:PatchRequest,b:PatchRequest):boolean{return a.findingId===b.findingId&&a.path===b.path&&a.startOffset===b.startOffset&&a.endOffset===b.endOffset&&a.expectedSha256===b.expectedSha256&&a.replacement===b.replacement}
export function transformationFor(finding:Finding){return transformations.find(t=>t.matches(finding));}
/** Runtime direction cannot establish semantic intent; accepted changes still need full validation. */
export function directionRequirement(finding:Finding):'independent'|'dependent'|'unknown'{
 const strategy=transformationFor(finding);if(!strategy)return 'unknown';
 if(strategy.id===BIDI_TRANSFORMATION_ID)return 'independent';
 if([CSS_CONFIGURED_TRANSFORMATION_ID,CSS_SPACING_TRANSFORMATION_ID,CSS_DIRECTIONAL_TRANSFORMATION_ID,REACT_INLINE_TRANSFORMATION_ID,CSS_ICON_TRANSFORMATION_ID].some(id=>id===strategy.id))return 'dependent';
 return 'unknown';
}
export function proposeTransformation(finding:Finding,source:string){
 const strategy=transformationFor(finding);
 if(!strategy)throw Error(finding.ruleId==='RTL.UTILITY.PHYSICAL'?'UTILITY_COMPILER_VERSION_AND_VARIANT_REVIEW_REQUIRED':finding.sourceMechanism==='emotion-template'||finding.sourceMechanism==='mui-sx'||finding.sourceMechanism==='mui-theme'?'CSS_IN_JS_OWNER_AND_RTL_PROCESSOR_REVIEW_REQUIRED':'UNSUPPORTED_TRANSFORMATION_FAMILY');
 return strategy.propose(finding,source);
}
