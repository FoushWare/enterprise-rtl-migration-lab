import { captureScopedDirectionEvidence, sameScopedDirectionEvidence, type ScopedDirectionEvidence } from './scoped-direction-evidence.js';
import { initializeOriginalPreview } from './original-preview-runtime.js';
import { configuredWorkflowChecks, workflowValidationPresentation, workflowValidationEvidenceIssue } from './workflow-validation.js';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, realpath, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';
import {loadProjectConfiguration,PROJECT_CONFIGURATION} from './project-configuration.js';
import {previewConfigurationDigest,PREVIEW_CONFIGURATION,loadPreviewConfiguration,configuredMapping,routeUrl} from './preview-configuration.js';
import { scan } from './scan.js';
import { verifiedSourceTransition } from './source-context.js';
import type { Finding } from './model.js';
import { directionRequirement, proposeTransformation } from './transformations.js';
import { approvedPreviewForSource } from './preview-manifest.js';
import { createReviewSession, startCandidateRuntime, stopCandidateRuntime, validateProjectSourcePath, REVIEW_SOURCE, type PatchRequest, type ReviewSession } from './review-session.js';
import { ControlledApplyService, type ApplyReceipt } from './controlled-apply.js';

const run = promisify(execFile);
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
export type FindingDecision = 'Pending' | 'Accepted' | 'Rejected' | 'Deferred' | 'Flagged';
export interface WorkflowEntry { finding: Finding; patch?: PatchRequest; reason: string; applied: boolean; decision: FindingDecision; notes: string; history: { decision: FindingDecision; notes: string; at: string }[] }
export interface WorkflowCheck { name: string; state: 'Passed' | 'Failed' | 'Unavailable' | 'Error' | 'Not run' | 'Not configured' | 'Not applicable'; detail: string; kind?: 'project' | 'scanner' | 'runtime'; command?: string; scope?: string }
export interface WorkflowValidation { state: 'Passed' | 'Failed' | 'Unavailable'; signature: string; checks: WorkflowCheck[]; at: string; hashes: Record<string, string>; directionEvidence?: ScopedDirectionEvidence }
export interface ReviewWorkflow {
  id: string; root: string; supersededBy?: string; rolledBackAt?: string; resumedFrom?: string; previewConfigDigest?:string; inputDigest: string; policyDigest: string; mode: 'one-by-one' | 'apply-first'; scope: string[];
  entries: WorkflowEntry[]; baseline: Record<string, string>; sourcePaths: Record<string, string>; session?: ReviewSession;
  validation?: WorkflowValidation; receipts?: ApplyReceipt[]; state: 'Reviewing' | 'Applying' | 'Applied' | 'Rolled Back'; createdAt: string;
}

/** Patches always address immutable originals. Recomposition avoids drift and removes only the rejected edit. */
export function composeWorkflowFile(before: string, patches: readonly PatchRequest[]): string {
  const sorted = [...patches].sort((a, b) => b.startOffset - a.startOffset);
  let boundary = before.length;
  let result = before;
  for (const p of sorted) {
    if (!Number.isInteger(p.startOffset) || !Number.isInteger(p.endOffset) || p.startOffset < 0 || p.endOffset <= p.startOffset || p.endOffset > boundary) throw new Error('OVERLAPPING_OR_INVALID_PATCH');
    if (sha(before.slice(p.startOffset, p.endOffset)) !== p.expectedSha256) throw new Error('STALE_PATCH_RANGE');
    result = result.slice(0, p.startOffset) + p.replacement + result.slice(p.endOffset);
    boundary = p.startOffset;
  }
  return result;
}
const included = (e: WorkflowEntry) => !!e.patch && e.applied && !['Rejected', 'Deferred', 'Flagged'].includes(e.decision);
const signature = (w: ReviewWorkflow) => sha(JSON.stringify(w.entries.filter(e => e.decision === 'Accepted' && included(e)).map(e => e.patch)));

export class ReviewWorkflowStore {
  private workflows: ReviewWorkflow[] = [];
  private queue: Promise<unknown> = Promise.resolve();
  constructor(readonly root: string, readonly path: string, private readonly applyService: ControlledApplyService, private readonly originalOrigin = 'http://127.0.0.1:4200') {}
  async load(): Promise<void> {
    try {
      const data = JSON.parse(await readFile(this.path, 'utf8')) as { version: number; workflows: ReviewWorkflow[] };
      if (data.version !== 1 || !Array.isArray(data.workflows)) throw new Error('WORKFLOW_STORE_INVALID');
      this.workflows = data.workflows.filter(w => w.root === this.root);
      for (const w of this.workflows) {
        if (w.session) w.session.runtime = undefined;
        if (w.state === 'Applying') w.receipts = await this.applyService.recoverAcceptedFileReceipts(w.id);
      }
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  async persist(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const tmp = `${this.path}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify({ version: 1, workflows: this.workflows }, null, 2), { flag: 'wx', mode: 0o600 });
    await rename(tmp, this.path);
  }
  exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation); this.queue = result.catch(() => undefined); return result;
  }
  list(): ReviewWorkflow[] { return [...this.workflows].reverse(); }
  get(id: string): ReviewWorkflow { const w = this.workflows.find(w => w.id === id); if (!w) throw new Error('WORKFLOW_NOT_FOUND'); return w; }
  find(inputDigest: string, policyDigest: string, mode: string): ReviewWorkflow | undefined { return [...this.workflows].reverse().find(w => w.inputDigest === inputDigest && w.policyDigest === policyDigest && w.mode === mode); }
  async begin(input: { inputDigest: string; policyDigest: string; mode: ReviewWorkflow['mode']; scope?: string[]; restart?: boolean }, resuming?: ReviewWorkflow): Promise<ReviewWorkflow> {
    if (!['one-by-one', 'apply-first'].includes(input.mode)) throw new Error('INVALID_WORKFLOW_MODE');
    const scope = input.scope ?? [];
    if (!Array.isArray(scope) || scope.some(p => typeof p !== 'string')) throw new Error('INVALID_WORKFLOW_SCOPE');
    const prior = this.find(input.inputDigest, input.policyDigest, input.mode);
    const restartable=prior&&['Rolled Back','Reviewing'].includes(prior.state);
    if (prior && !resuming && !(input.restart === true && restartable)) { if (JSON.stringify(prior.scope) !== JSON.stringify(scope)) throw new Error('WORKFLOW_SCOPE_MISMATCH'); return prior; }
    const report = await scan(this.root);
    if (report.inputDigest !== input.inputDigest || report.policyDigest !== input.policyDigest) throw new Error('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
    if (scope.some(path => !report.files.includes(path))) throw new Error('INVALID_WORKFLOW_SCOPE');
    const previewConfigDigest=await previewConfigurationDigest(this.root);
    let configuredFiles:string[]=[];
    try{configuredFiles=Object.values((await loadPreviewConfiguration(this.root)).applications).flatMap(a=>[a.viteConfig,a.entry]);}catch{/* Invalid preview configuration cannot disable code-only proposals. */}
    const baseline: Record<string, string> = {}, sourcePaths: Record<string, string> = {};
    // Whole scanned source/config identity protects unchanged files too.
    const rootConfigs = (await readdir(this.root)).filter(p => /^(tsconfig.*\.json|(?:vite|vitest|playwright|eslint)(?:\.[\w-]+)*\.config\.[cm]?[jt]s|package-lock\.json|rtl-preview\.config\.json)$/.test(p));
    const project=await loadProjectConfiguration(this.root);
    const projectConfigs: string[] = [];
    if(!project){
    for (const group of ['apps', 'libs']) for (const project of await readdir(join(this.root, group))) {
      const directory = join(group, project);
      for (const name of await readdir(join(this.root, directory))) if (/^(project\.json|tsconfig.*\.json|vite\.config\.[cm]?[jt]s)$/.test(name)) projectConfigs.push(join(directory, name));
    }
    }
    const optionalConfigs=await Promise.all(['nx.json','rtl-scanner.config.json',PROJECT_CONFIGURATION].map(async path=>await readFile(join(this.root,path)).then(()=>path).catch(error=>{if(error.code==='ENOENT')return '';throw error})));
    for (const path of [...new Set([...report.files, 'package.json', ...optionalConfigs.filter(Boolean), ...rootConfigs, ...projectConfigs,...configuredFiles])]) {
      sourcePaths[path] = await validateProjectSourcePath(this.root, path);
      baseline[path] = await readFile(sourcePaths[path], 'utf8');
    }
    const entries = report.findings.filter(f => !scope.length || scope.includes(f.path)).map(finding => {
      const entry: WorkflowEntry = { finding, reason: '', applied: false, decision: 'Pending', notes: '', history: [] };
      try { if (!report.complete) throw new Error('INCOMPLETE_SCAN_REQUIRES_MANUAL_RESOLUTION'); if (report.diagnostics.some(d => d.code === 'RUNTIME_DIRECTION_UNKNOWN') && directionRequirement(finding) === 'unknown') throw new Error('RUNTIME_DIRECTION_STRATEGY_UNKNOWN'); if (finding.exceptionReason) throw new Error('POLICY_EXCEPTION_REQUIRES_REVIEW'); const proposal=proposeTransformation(finding,baseline[finding.path]);entry.patch=proposal.patch;entry.reason=proposal.transformationId+': '+proposal.reason; }
      catch (error) { entry.reason = `${error instanceof Error ? error.message : 'UNSUPPORTED'}: inspect code and resolve manually; no automatic change.`; }
      return entry;
    });
    const conflicting = entries.filter(e => e.patch && entries.some(other => other !== e && other.patch && other.patch.path === e.patch!.path && other.patch.startOffset < e.patch!.endOffset && e.patch!.startOffset < other.patch.endOffset));
    for (const e of conflicting) { e.reason = 'CONFLICTING_PATCH: overlapping transformations need manual resolution.'; e.patch = undefined; }
    const w: ReviewWorkflow = { id: randomUUID(), root: this.root, ...(resuming?{resumedFrom:resuming.id}:{}), previewConfigDigest,inputDigest: report.inputDigest, policyDigest: report.policyDigest, mode: input.mode, scope, entries, baseline, sourcePaths, state: 'Reviewing', createdAt: new Date().toISOString() };
    if(input.restart&&prior&&restartable&&!resuming){if(prior.session)prior.session=await stopCandidateRuntime(prior.session);prior.supersededBy=w.id;}
    this.workflows.push(w);
    if (!resuming && w.mode === 'apply-first' && entries.some(e => e.patch)) { for (const e of entries) e.applied = !!e.patch; await this.rebuild(w); }
    await this.persist(); return w;
  }
  /** Resume analysis only. Historical decisions, candidates and validation never enter the new review. */
  async resumeAfterRollback(id:string):Promise<ReviewWorkflow> {
    const historical=this.get(id);
    if(historical.state!=='Rolled Back')throw Error('SUCCESSFUL_ROLLBACK_REQUIRED');
    const report=await verifiedSourceTransition(this.root,historical);
    const prior=this.workflows.find(w=>w.resumedFrom===id);
    if(prior){await this.fresh(prior);return prior;}
    return this.begin({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:historical.mode,scope:historical.scope},historical);
  }
  private async fresh(w: ReviewWorkflow): Promise<void> {
    if(await previewConfigurationDigest(this.root)!==(w.previewConfigDigest??sha('')))throw Error('PREVIEW_CONFIGURATION_CHANGED');
    if (await realpath(w.root) !== w.root || w.root !== this.root) throw new Error('PROJECT_ROOT_IDENTITY_MISMATCH');
    for (const [path, before] of Object.entries(w.baseline)) {
      const target = await validateProjectSourcePath(this.root, path);
      if (target !== w.sourcePaths[path] || sha(await readFile(target, 'utf8')) !== sha(before)) throw new Error('STALE_ORIGINAL_SOURCE');
    }
    const report = await scan(this.root);
    if (report.inputDigest !== w.inputDigest || report.policyDigest !== w.policyDigest) throw new Error('STALE_PROJECT_IDENTITY');
  }
  private async candidateFresh(w: ReviewWorkflow): Promise<void> {
    if (!w.session) throw new Error('CANDIDATE_REQUIRED');
    for (const [path, before] of Object.entries(w.baseline)) {
      const expected = composeWorkflowFile(before, w.entries.filter(e => included(e) && e.patch!.path === path).map(e => e.patch!));
      const actual = await readFile(await validateProjectSourcePath(w.session.candidateRoot, path), 'utf8');
      if (actual !== expected) throw new Error('STALE_CANDIDATE_SOURCE');
    }
  }
  private ensureReviewing(w: ReviewWorkflow): void { if (w.supersededBy) throw new Error('HISTORICAL_REVIEW_LOCKED'); if (w.state !== 'Reviewing') throw new Error('WORKFLOW_LOCKED_' + w.state); }
  async rebuild(w: ReviewWorkflow): Promise<void> {
    await this.fresh(w);
    if (w.session) await this.candidateFresh(w);
    if (!w.session) w.session = await createReviewSession(this.root,Object.hasOwn(w.baseline,REVIEW_SOURCE)?REVIEW_SOURCE:w.entries.find(e=>e.patch)?.finding.path);
    if (w.session.runtime) w.session = await stopCandidateRuntime(w.session);
    for (const path of new Set(w.entries.filter(e => e.patch).map(e => e.finding.path))) {
      const after = composeWorkflowFile(w.baseline[path], w.entries.filter(e => included(e) && e.patch!.path === path).map(e => e.patch!));
      await writeFile(await validateProjectSourcePath(w.session.candidateRoot, path), after, 'utf8');
    }
    w.session.candidateSha256 = sha(await readFile(join(w.session.candidateRoot, w.session.sourcePath), 'utf8'));
    w.validation = undefined;
  }
  async change(id: string, findingId: string, input: { action: string; notes?: string }): Promise<ReviewWorkflow> {
    const w = this.get(id); this.ensureReviewing(w); await this.fresh(w);
    const e = w.entries.find(e => e.finding.id === findingId); if (!e) throw new Error('FINDING_NOT_IN_SCOPE');
    if (!['apply', 'notes', 'Accepted', 'Rejected', 'Deferred', 'Flagged'].includes(input.action)) throw new Error('INVALID_REVIEW_ACTION');
    if (input.notes !== undefined && (typeof input.notes !== 'string' || input.notes.length > 4000)) throw new Error('INVALID_REVIEW_NOTES');
    if (input.action === 'notes') { e.notes = input.notes ?? ''; e.history.push({ decision: e.decision, notes: e.notes, at: new Date().toISOString() }); await this.persist(); return w; }
    if (input.action === 'apply' && !e.patch) throw new Error('UNSUPPORTED_TRANSFORMATION');
    if (input.action === 'Accepted' && (!e.patch || !e.applied || ['Rejected', 'Deferred', 'Flagged'].includes(e.decision))) throw new Error('APPLY_CANDIDATE_BEFORE_ACCEPTANCE');
    // Check the previous composition before changing membership.
    if (w.session) await this.candidateFresh(w);
    const previous = { ...e };
    if (input.action === 'apply') { e.applied = true; if (['Rejected', 'Deferred', 'Flagged'].includes(e.decision)) e.decision = 'Pending'; }
    else { e.decision = input.action as FindingDecision; e.notes = input.notes ?? ''; if (e.decision !== 'Accepted') e.applied = false; e.history.push({ decision: e.decision, notes: e.notes, at: new Date().toISOString() }); }
    // Rebuild from original coordinates, not from the previously patched content.
    try { await this.writeComposition(w); await this.persist(); return w; }
    catch (error) { Object.assign(e, previous); throw error; }
  }
  private async writeComposition(w: ReviewWorkflow): Promise<void> {
    if (!w.session && !w.entries.some(included)) { w.validation = undefined; return; }
    if (!w.session) w.session = await createReviewSession(this.root,Object.hasOwn(w.baseline,REVIEW_SOURCE)?REVIEW_SOURCE:w.entries.find(e=>e.patch)?.finding.path);
    if (w.session.runtime) w.session = await stopCandidateRuntime(w.session);
    for (const path of new Set(w.entries.filter(e => e.patch).map(e => e.finding.path))) await writeFile(await validateProjectSourcePath(w.session.candidateRoot, path), composeWorkflowFile(w.baseline[path], w.entries.filter(e => included(e) && e.patch!.path === path).map(e => e.patch!)), 'utf8');
    w.session.candidateSha256 = sha(await readFile(join(w.session.candidateRoot, w.session.sourcePath), 'utf8')); w.validation = undefined;
  }
  async runtime(id: string,application?:string): Promise<ReviewWorkflow> {
    const w = this.get(id); await this.fresh(w); await this.candidateFresh(w);
    w.session = await startCandidateRuntime(w.session!,application); await this.persist(); return w;
  }
  /** Called only after the client verifies the original target. Serialized by Companion.
   * Reuses the current composition/runtime; never changes a decision or applies to source. */
  async preparePreview(id:string,input:{findingId:string;application:string;routeId:string;inputDigest:string;policyDigest:string}):Promise<ReviewWorkflow> {
    const w=this.get(id);this.ensureReviewing(w);await this.fresh(w);
    if(input.inputDigest!==w.inputDigest||input.policyDigest!==w.policyDigest)throw Error('PREVIEW_SOURCE_IDENTITY_MISMATCH');
    const entry=w.entries.find(e=>e.finding.id===input.findingId);
    if(!entry?.patch)throw Error(entry?.reason||'PREVIEW_FIX_UNSUPPORTED');
    if(['Rejected','Deferred','Flagged'].includes(entry.decision))throw Error('PREVIEW_DECISION_'+entry.decision.toUpperCase());
    const mapping=configuredMapping(entry.finding,await loadPreviewConfiguration(this.root));
    if(!mapping.routes.some(r=>r.id===input.routeId&&r.application===input.application))throw Error('PREVIEW_MAPPING_UNAVAILABLE');
    if(w.session)await this.candidateFresh(w);
    if(!entry.applied)await this.change(id,entry.finding.id,{action:'apply'});
    const prepared=await this.runtime(id,input.application);
    if(prepared.session?.runtime?.status!=='healthy')throw Error(prepared.session?.runtime?.error||'CANDIDATE_RUNTIME_UNAVAILABLE');
    return prepared;
  }
  async preview(id: string, findingId: string, mode: string): Promise<unknown> {
    const w = this.get(id); const e = w.entries.find(e => e.finding.id === findingId);
    const mapping = e && approvedPreviewForSource(e.finding.path);
    if (!mapping || !e?.patch || !['ltr', 'rtl'].includes(mode)) throw new Error('LIVE_PREVIEW_MAPPING_UNAVAILABLE');
    await this.fresh(w); if (w.session) await this.candidateFresh(w);
    let originalAvailable = false;
    try { const identity = await fetch(this.originalOrigin + '/__rtl_preview_identity', { signal: AbortSignal.timeout(1200) }).then(r => r.json()) as { role: string; sourceSha256: string; projectRoot: string }; originalAvailable = identity.projectRoot === this.root && identity.role === 'original' && identity.sourceSha256 === sha(w.baseline[REVIEW_SOURCE]); } catch { /* show unavailable */ }
    const route = mapping.routes[mode as 'ltr' | 'rtl'];
    const candidateOrigin = w.session?.runtime?.status === 'healthy' ? w.session.runtime.origin : null;
    return { originalAvailable, originalUrl: this.originalOrigin + route, originalSourceSha256: sha(w.baseline[REVIEW_SOURCE]), candidateSessionId: w.session?.id ?? null, candidateSourceSha256: w.session?.candidateSha256 ?? null, candidateOrigin, url: (candidateOrigin ?? this.originalOrigin) + route, findingId };
  }
  private async directionEvidence(w:ReviewWorkflow):Promise<ScopedDirectionEvidence|undefined>{
    const selected=w.entries.filter(e=>e.decision==='Accepted'&&included(e));
    if(selected.some(e=>directionRequirement(e.finding)==='unknown'))throw Error('RUNTIME_DIRECTION_STRATEGY_UNKNOWN');
    const dependent=selected.filter(e=>directionRequirement(e.finding)==='dependent');if(!dependent.length)return undefined;
    return captureScopedDirectionEvidence(this.root,w,dependent,async application=>{await initializeOriginalPreview(this.root,application);await this.runtime(w.id,application)});
  }
  async validate(id: string): Promise<ReviewWorkflow> {
    const w = this.get(id); this.ensureReviewing(w); await this.fresh(w);
    if (!w.entries.some(e => e.decision === 'Accepted' && included(e))) throw new Error('ACCEPTED_CHANGES_REQUIRED');
    if (w.session) await this.candidateFresh(w);
    // The final candidate contains only explicit acceptances. Pending batch edits remain pending in the inventory.
    for (const e of w.entries) if (e.decision !== 'Accepted') e.applied = false;
    await this.writeComposition(w); await this.persist();
    const checks: WorkflowCheck[] = []; const hashes: Record<string, string> = {};
    const pkg = JSON.parse(w.baseline['package.json']) as { scripts?: Record<string, string> };
    const project=await loadProjectConfiguration(this.root);
    for (const name of ['typecheck', 'build', 'test'] as const) {
      const args=project?project.validation[name]:pkg.scripts?.[name]?['run',name]:undefined;
      const configured=configuredWorkflowChecks(w).find(c=>c.name===name)!;
      if (!args) { checks.push(configured); continue; }
      try { const result = await run(project?.packageManager??'npm', args, { cwd: w.session!.candidateRoot, env: { ...process.env, NX_DAEMON: 'false', NX_ISOLATE_PLUGINS: 'false' }, timeout: 180_000, maxBuffer: 2_000_000 }); checks.push({ ...configured, name, state: 'Passed', detail: (result.stdout + result.stderr).slice(-8000) }); }
      catch (error) { const failure = error as { stdout?: string; stderr?: string; message: string; code?: string | number; signal?: string }; checks.push({ ...configured, name, state: typeof failure.code === 'number' || failure.signal ? 'Failed' : 'Error', detail: ((failure.stdout ?? '') + (failure.stderr ?? '') + failure.message).slice(-8000) }); }
    }
    try {
      const before = await scan(this.root), after = await scan(w.session!.candidateRoot);
      const unresolved = w.entries.filter(e => e.decision === 'Accepted' && after.findings.filter(f => f.ruleId === e.finding.ruleId && f.path === e.finding.path).length !== before.findings.filter(f => f.ruleId === e.finding.ruleId && f.path === e.finding.path).length - w.entries.filter(a => a.decision === 'Accepted' && a.finding.ruleId === e.finding.ruleId && a.finding.path === e.finding.path).length);
      checks.push({ name: 'scanner', state: after.complete && !unresolved.length ? 'Passed' : 'Failed', detail: JSON.stringify({ before: before.inputDigest, after: after.inputDigest, beforeFindings: before.findings.length, afterFindings: after.findings.length, unresolved: unresolved.map(e => e.finding.id), complete: after.complete }) });
    } catch (error) { checks.push({ name: 'scanner', state: 'Failed', detail: String(error) }); }
    const configuration=await loadPreviewConfiguration(this.root);
    if(project||(!Object.hasOwn(w.baseline,REVIEW_SOURCE)&&Object.keys(configuration.applications).length)){
      const accepted=w.entries.filter(e=>e.decision==='Accepted'&&included(e));
      const routes=new Map<string,{application:string;route:ReturnType<typeof configuredMapping>['routes'][number];entries:WorkflowEntry[]}>();
      for(const entry of accepted){
        const mapping=configuredMapping(entry.finding,configuration);
        if(!mapping.configured||!mapping.routes.length){checks.push({name:'runtime:'+entry.finding.id,state:'Unavailable',detail:'Accepted change has no explicit configured source-to-target route.'});continue;}
        for(const route of mapping.routes){const prior=routes.get(route.id);if(prior)prior.entries.push(entry);else routes.set(route.id,{application:route.application,route,entries:[entry]});}
      }
      for(const {application,route,entries} of routes.values())try{
        await this.runtime(id,application);
        if(w.session?.runtime?.status!=='healthy')throw Error('CANDIDATE_RUNTIME_UNAVAILABLE');
        const browser=await chromium.launch({headless:true});
        try{for(const mode of ['ltr','rtl'] as const){
          const page=await browser.newPage({viewport:{width:1280,height:800}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
          await page.goto(routeUrl(route,mode,w.session.runtime.origin),{waitUntil:'domcontentloaded',timeout:20000});
          await page.locator(configuration.applications[application].readySelector).first().waitFor();
          await page.waitForFunction(mode=>document.documentElement.dir===mode,mode,{timeout:10000});
          const targets=[];
          for(const entry of entries){
            const mapping=configuredMapping(entry.finding,configuration);
            await page.locator(mapping.selector).first().waitFor({state:'visible',timeout:10000});
            const evidence=await page.evaluate(({selector,sourceSelector,path,bidi})=>{
              const nodes=[...document.querySelectorAll(selector)],styles=[...document.querySelectorAll('style[data-vite-dev-id]')].filter(n=>n.getAttribute('data-vite-dev-id')?.replaceAll('\\','/').endsWith('/'+path));
              const rules:CSSStyleRule[]=[];function walk(items:CSSRuleList){for(const rule of items){if('selectorText' in rule)rules.push(rule as CSSStyleRule);else if('cssRules' in rule)walk((rule as CSSGroupingRule).cssRules);}}
              for(const style of styles)if((style as HTMLStyleElement).sheet)walk((style as HTMLStyleElement).sheet!.cssRules);
              const matched=!sourceSelector||rules.some(r=>r.selectorText.split(',').map(s=>s.trim()).includes(sourceSelector)&&nodes.some(n=>n.matches(r.selectorText)));
              return {path,selector,sourceRuleMatched:matched,count:nodes.length,bdi:!bidi||nodes.some(n=>n.matches('bdi[dir="auto"]')||n.querySelector('bdi[dir="auto"]')),computed:nodes.slice(0,5).map(n=>({direction:getComputedStyle(n).direction,textAlign:getComputedStyle(n).textAlign,insetInlineStart:getComputedStyle(n).insetInlineStart,insetInlineEnd:getComputedStyle(n).insetInlineEnd}))};
            },{selector:mapping.selector,sourceSelector:mapping.sourceSelector,path:entry.finding.path,bidi:entry.finding.ruleId==='RTL.BIDI.ISOLATION'});
            if(!evidence.sourceRuleMatched||!evidence.bdi)throw Error('CONFIGURED_SOURCE_TARGET_NOT_VERIFIED:'+entry.finding.path);
            targets.push(evidence);
          }
          if(errors.length)throw Error('RUNTIME_DOM_FAILED:'+errors.join(';'));
          checks.push({name:'runtime-'+route.id+'-'+mode,state:'Passed',detail:JSON.stringify({route:page.url(),direction:mode,viewport:{width:1280,height:800},targets,errors})});await page.close();
        }}finally{await browser.close();}
      }catch(error){checks.push({name:'runtime-'+route.id,state:'Unavailable',detail:String(error)});}
    }else{
    try {
      await this.runtime(id);
      if (w.session?.runtime?.status !== 'healthy') throw new Error('CANDIDATE_RUNTIME_UNAVAILABLE');
      const browser = await chromium.launch({ headless: true });
      try {
        for (const mode of ['ltr', 'rtl'] as const) {
          const page = await browser.newPage(); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
          await page.goto(w.session.runtime.origin + (mode === 'ltr' ? '/invoices' : '/invoices?demo=unmigrated-rtl&lang=ar'), { waitUntil: 'domcontentloaded', timeout: 20_000 });
          await page.locator('.invoice-link').first().waitFor();
          if (await page.locator('html').getAttribute('dir') !== mode || errors.length) throw new Error('RUNTIME_DOM_FAILED:' + errors.join(';'));
          if (w.entries.some(e => e.finding.ruleId==='RTL.BIDI.ISOLATION' && e.finding.path === REVIEW_SOURCE && e.decision === 'Accepted') && await page.locator('.invoice-link bdi[dir="auto"]').count() === 0) throw new Error('PATCHED_DOM_MISSING');
          checks.push({ name: 'runtime-' + mode, state: 'Passed', detail: 'Real /invoices route rendered; direction and supported patched DOM verified.' }); await page.close();
        }
      } finally { await browser.close(); }
    } catch (error) { checks.push({ name: 'runtime', state: 'Unavailable', detail: String(error) }); }
    for (const e of w.entries.filter(e => e.decision === 'Accepted')) if (!approvedPreviewForSource(e.finding.path)) checks.push({ name: 'live-preview:' + e.finding.path, state: 'Unavailable', detail: 'No approved owning-route mapping. Code review remains available.' });
    }
    let directionEvidence:ScopedDirectionEvidence|undefined;
    try{directionEvidence=await this.directionEvidence(w);if(directionEvidence)checks.push({name:'runtime-scoped-direction',state:'Passed',detail:'Server observed matching mapped target direction in configured LTR and RTL application states; semantic review remains required.'});}
    catch(error){checks.push({name:'runtime-scoped-direction',state:'Unavailable',detail:String(error)});}
    await this.candidateFresh(w); await this.fresh(w);
    for (const path of Object.keys(w.baseline)) hashes[path] = sha(await readFile(await validateProjectSourcePath(w.session!.candidateRoot, path), 'utf8'));
    const required = checks.filter(c => !c.name.startsWith('live-preview:') && !(['Not configured','Not applicable'].includes(c.state) && ['typecheck', 'build', 'test'].includes(c.name)));
    w.validation = { state: required.some(c => c.state === 'Failed') ? 'Failed' : required.some(c => ['Unavailable','Error','Not run'].includes(c.state)) ? 'Unavailable' : 'Passed', signature: signature(w), checks, hashes, ...(directionEvidence?{directionEvidence}:{}), at: new Date().toISOString() };
    await this.persist(); return w;
  }
  async apply(id: string, confirmation: string): Promise<ReviewWorkflow> {
    const w = this.get(id); if(w.supersededBy)throw Error('HISTORICAL_REVIEW_LOCKED'); if (w.state === 'Applied') return w;
    if (!w.validation || w.validation.state !== 'Passed' || w.validation.signature !== signature(w)) throw new Error('VALIDATED_ACCEPTED_CANDIDATE_REQUIRED');
    const evidenceIssue=workflowValidationEvidenceIssue(w);if(evidenceIssue)throw Error('VALIDATION_EVIDENCE_MISSING: '+evidenceIssue);
    if(w.entries.some(e=>e.decision==='Accepted'&&included(e)&&directionRequirement(e.finding)==='unknown'))throw Error('RUNTIME_DIRECTION_STRATEGY_UNKNOWN');
    if (w.state === 'Reviewing') await this.fresh(w);
    if (!['Reviewing', 'Applying'].includes(w.state)) throw new Error('WORKFLOW_LOCKED_' + w.state);
    if (w.state === 'Applying') {
      for (const [path, before] of Object.entries(w.baseline)) {
        const target = await validateProjectSourcePath(this.root, path);
        const after = composeWorkflowFile(before, w.entries.filter(e => e.decision === 'Accepted' && included(e) && e.finding.path === path).map(e => e.patch!));
        const current = sha(await readFile(target, 'utf8'));
        if (target !== w.sourcePaths[path] || (current !== sha(before) && current !== sha(after))) throw new Error('STALE_APPLY_SOURCE');
      }
    }
    await this.candidateFresh(w);
    if(w.entries.some(e=>e.decision==='Accepted'&&included(e)&&directionRequirement(e.finding)==='dependent')){
      if(w.state!=='Reviewing'||!w.validation.directionEvidence)throw Error('DIRECTION_EVIDENCE_REVALIDATION_REQUIRED');
      const current=await this.directionEvidence(w);if(!current||!sameScopedDirectionEvidence(w.validation.directionEvidence,current))throw Error('DIRECTION_EVIDENCE_STALE');
      await this.fresh(w);await this.candidateFresh(w);
    }
    for (const [path, hash] of Object.entries(w.validation.hashes)) if (sha(await readFile(await validateProjectSourcePath(w.session!.candidateRoot, path), 'utf8')) !== hash) throw new Error('STALE_VALIDATED_CANDIDATE');
    if (confirmation !== 'APPLY_CONFIRMED') throw new Error('APPLY_CONFIRMATION_REQUIRED');
    w.state = 'Applying'; await this.persist();
    const files = [...new Set(w.entries.filter(e => e.decision === 'Accepted' && included(e)).map(e => e.finding.path))].map(path => ({ path, before: w.baseline[path], after: composeWorkflowFile(w.baseline[path], w.entries.filter(e => e.decision === 'Accepted' && included(e) && e.finding.path === path).map(e => e.patch!)) }));
    try { w.receipts = await this.applyService.applyAcceptedFiles(w.id, files, confirmation); w.state = 'Applied'; await this.persist(); return w; }
    catch (error) { w.receipts = await this.applyService.recoverAcceptedFileReceipts(w.id); await this.persist(); throw error; }
  }
  async rollback(id: string, confirmation: string): Promise<ReviewWorkflow> {
    const w = this.get(id); if (confirmation !== 'ROLLBACK_CONFIRMED') throw new Error('ROLLBACK_CONFIRMATION_REQUIRED');
    if (w.state === 'Rolled Back') return w;
    if (!w.receipts?.length) throw new Error('APPLY_RECEIPTS_REQUIRED');
    await this.applyService.rollbackAcceptedFiles(w.receipts); w.state = 'Rolled Back'; w.rolledBackAt=new Date().toISOString(); await this.persist(); return w;
  }
  async shutdown(): Promise<void> { for (const w of this.workflows) if (w.session) w.session = await stopCandidateRuntime(w.session); await this.persist(); }
  view(w: ReviewWorkflow): unknown {
    const { baseline, sourcePaths: _paths, ...rest } = w;
    const files = [...new Set(w.entries.map(e => e.finding.path))].map(path => {
      const before = baseline[path], after = composeWorkflowFile(before, w.entries.filter(e => included(e) && e.finding.path === path).map(e => e.patch!));
      return { path, originalSha256: sha(before), candidateSha256: sha(after), before, after, diff: before === after ? 'No candidate changes.' : `--- ${path}\n+++ ${path}\n- ${before.split('\n').join('\n- ')}\n+ ${after.split('\n').join('\n+ ')}` };
    });
    const fresh=!!w.validation&&w.validation.signature===signature(w);
    const evidenceIssue=w.validation?workflowValidationEvidenceIssue(w):undefined;
    const eligible=!evidenceIssue&&!w.supersededBy&&fresh&&w.validation?.state==='Passed'&&['Reviewing','Applying'].includes(w.state)&&w.entries.some(e=>e.decision==='Accepted'&&included(e));
    const reason=w.supersededBy?'Historical review was superseded; start from the current review.':eligible?'Snapshot eligible under existing Apply policy: missing or explicitly excluded project commands are not required; scanner/runtime checks and source/candidate identity guards still apply.':w.state!=='Reviewing'&&w.state!=='Applying'?'Historical review cannot apply changes.':!w.entries.some(e=>e.decision==='Accepted'&&included(e))?'Approve at least one prepared change.':!fresh?'Validate the current accepted candidate before Apply.':evidenceIssue?evidenceIssue:'Resolve required checks: '+(w.validation?.checks.filter(c=>['Failed','Unavailable','Error','Not run'].includes(c.state)&&!c.name.startsWith('live-preview:')).map(c=>c.name+': '+c.state+' · '+c.detail.slice(0,180)).join('; ')||w.validation?.state);
    return { ...rest, schemaVersion: 2, files, validationPresentation:workflowValidationPresentation(w,fresh), applyEligibility:{eligible,reason} };
  }
}
