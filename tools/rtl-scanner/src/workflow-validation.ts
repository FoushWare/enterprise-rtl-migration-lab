import type { ReviewWorkflow, WorkflowCheck } from './review-workflow.js';
import type { ProjectConfiguration } from './project-configuration.js';

export const projectCheckNames = ['typecheck', 'build', 'test'] as const;
/** Read configuration from the protected review baseline, including on historical records. */
export function configuredWorkflowChecks(w: Pick<ReviewWorkflow, 'baseline'>): WorkflowCheck[] {
  const project = w.baseline['rtl-project.config.json'] ? JSON.parse(w.baseline['rtl-project.config.json']) as ProjectConfiguration : undefined;
  const pkg = JSON.parse(w.baseline['package.json']) as { scripts?: Record<string, string> };
  return projectCheckNames.map(name => {
    const args = project ? project.validation[name] : pkg.scripts?.[name] ? ['run', name] : undefined;
    const excluded = project?.validationExclusions?.[name];
    return { name, kind: 'project', state: args ? 'Not run' : excluded ? 'Not applicable' : 'Not configured',
      command: args ? [project?.packageManager ?? 'npm', ...args].map(a => JSON.stringify(a)).join(' ') : undefined,
      scope: 'Accepted-only candidate snapshot. The configured command determines project or subset scope.',
      detail: args ? 'Configured command has not executed for this accepted-change snapshot.' : excluded || 'No command supplied. This does not establish whether the project has tests.' };
  });
}
/** Required execution evidence must exist; absent records are never successful checks. */
export function workflowValidationEvidenceIssue(w: ReviewWorkflow): string | undefined {
  if(!w.validation)return 'Validation has not run.';
  if(!Array.isArray(w.validation.checks))return 'Required execution records are missing. Validate accepted changes.';
  const missing=configuredWorkflowChecks(w).filter(c=>c.state==='Not run'&&!w.validation!.checks.some(result=>result.name===c.name&&result.state!=='Not run')).map(c=>c.name);
  if(missing.length)return 'Configured checks not run: '+missing.join(', ')+'. Validate accepted changes.';
  if(!w.validation.checks.some(c=>c.name==='scanner')||!w.validation.checks.some(c=>c.name.startsWith('runtime')))return 'Required scanner or runtime execution evidence is missing. Validate accepted changes.';
  if(Object.keys(w.baseline).some(path=>!w.validation!.hashes?.[path]))return 'Candidate hash evidence is missing. Validate accepted changes.';
}
export function workflowValidationPresentation(w: ReviewWorkflow, fresh: boolean) {
  const configured = configuredWorkflowChecks(w),results=Array.isArray(w.validation?.checks)?w.validation.checks:[];
  const checks = configured.map(check => {
    if (check.state !== 'Not run') return check;
    const result = results.find(c => c.name === check.name);
    return result ? { ...check, ...result, kind: 'project' as const, command: check.command, scope: check.scope } : check;
  });
  checks.push(...(results.filter(c => !projectCheckNames.includes(c.name as typeof projectCheckNames[number])).map(c => ({ ...c, kind: c.name === 'scanner' ? 'scanner' as const : 'runtime' as const, scope: c.name === 'scanner' ? 'Rescan of candidate; accepted findings must resolve.' : 'Recorded mapped routes and rendered targets only; not project unit tests.' })) ?? []));
  const projects = checks.filter(c => c.kind === 'project');
  const ran = projects.filter(c => ['Passed', 'Failed'].includes(c.state));
  const missing = projects.filter(c => c.state === 'Not configured');
  const blocked = checks.filter(c => ['Failed', 'Unavailable', 'Error'].includes(c.state) && !c.name.startsWith('live-preview:'));
  const evidenceIssue=w.validation?workflowValidationEvidenceIssue(w):undefined;
  const status = !w.validation ? 'Not run' : !fresh ? 'Unavailable' : (blocked.some(c => c.state === 'Failed') || w.validation.state==='Failed') ? 'Failed' : blocked.length || evidenceIssue || w.validation.state==='Unavailable' ? 'Unavailable' : !ran.length ? 'Technical validation unavailable' : missing.length ? 'Limited validation' : 'Passed';
  const explanation = !w.validation ? 'Validate accepted changes to execute checks for the exact candidate snapshot.' : !fresh ? 'Validation is stale for the accepted candidate. Validate again.' : evidenceIssue ? evidenceIssue : 'Project commands executed: ' + (ran.map(c => c.name + ' (' + c.state + ')').join(', ') || 'none') + '. ' + (missing.length ? 'Not configured: ' + missing.map(c => c.name).join(', ') + '. ' : '') + 'Scanner and runtime evidence are listed separately. Build does not imply tests or typecheck.';
  return { status, explanation, checks, coverage: 'Unknown', coverageDetail: 'No matching change coverage evidence is available for this source, accepted candidate and executed test run. Passing tests alone do not establish finding or component coverage. Execution coverage does not prove RTL visual correctness.' };
}
