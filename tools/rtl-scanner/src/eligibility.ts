import type { Finding } from './model.js';
import { transformations, transformationFor, proposeTransformation } from './transformations.js';

export type CodemodEligibility = 'MANUAL' | 'ASSISTED' | 'AUTOMATED_ELIGIBLE';
export interface EligibilityDecision { eligibility: CodemodEligibility; reason: string; evidence: readonly string[]; transformationId: string | null; blockers: readonly string[] }

// This registry describes implemented transformations, not scanner-rule coverage.
export const verifiedTransformationStrategies=Object.fromEntries(transformations.map(t=>[t.key,{preconditions:['verified scanner source range','parser and family-specific safeguards','explicit semantic acceptance'],transformationId:t.id}]));

export function classifyEligibility(finding: Finding, evidenceComplete = true, sourceText?: string): EligibilityDecision {
  if (!evidenceComplete) return { eligibility: 'MANUAL', reason: 'Required evidence is incomplete or stale.', evidence: finding.evidenceIds, transformationId: null, blockers: ['INCOMPLETE_OR_STALE_EVIDENCE'] };
  if (transformationFor(finding) && sourceText) { try { const proposal = proposeTransformation(finding, sourceText); return { eligibility: finding.ruleId==='RTL.BIDI.ISOLATION'?'AUTOMATED_ELIGIBLE':'ASSISTED', reason: proposal.reason, evidence: finding.evidenceIds, transformationId: proposal.transformationId, blockers: [] }; } catch (error) { return { eligibility: 'ASSISTED', reason: 'The transformation preconditions are not satisfied; inspect the concrete blocker before proposing a change.', evidence: finding.evidenceIds, transformationId: transformationFor(finding)!.id, blockers: [error instanceof Error ? error.message : 'TRANSFORMATION_PRECONDITION_FAILED'] }; } }
  if (finding.ruleId === 'RTL.BIDI.ISOLATION') return { eligibility: 'ASSISTED', reason: 'A bounded bidi-isolation proposal is possible, but rendered punctuation and product semantics still require human review.', evidence: finding.evidenceIds, transformationId: 'bidi-isolate-auto', blockers: ['HUMAN_SEMANTIC_REVIEW_REQUIRED', 'NO_VERIFIED_CODEMOD_IMPLEMENTATION'] };
  return { eligibility: 'MANUAL', reason: 'Semantic intent, runtime behavior, or styling ownership is not established by static evidence.', evidence: finding.evidenceIds, transformationId: null, blockers: ['SEMANTIC_OR_RUNTIME_INTENT_UNPROVEN'] };
}
