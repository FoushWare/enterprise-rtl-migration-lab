import {describe,it,expect} from 'vitest';
import {configuredWorkflowChecks,workflowValidationPresentation} from '../src/workflow-validation.js';
import type {ReviewWorkflow,WorkflowCheck} from '../src/review-workflow.js';

function workflow(validation:Record<string,string[]>={typecheck:['run','typecheck'],build:['run','build'],test:['run','test']}):ReviewWorkflow {
  return {id:'review',root:'/disposable',mode:'one-by-one',inputDigest:'source',policyDigest:'policy',scope:[],entries:[],sourcePaths:{},state:'Reviewing',createdAt:'2026-11-18',baseline:{'package.json':'{}','rtl-project.config.json':JSON.stringify({packageManager:'npm',validation})}};
}
function recorded(w:ReviewWorkflow,checks:WorkflowCheck[]){w.validation={state:'Passed',signature:'snapshot',hashes:Object.fromEntries(Object.keys(w.baseline).map(path=>[path,'candidate'])),at:'2026-11-18',checks:[{name:'scanner',state:'Passed',detail:'rescan'},{name:'runtime-people',state:'Passed',detail:'targets'},...configuredWorkflowChecks(w).filter(c=>c.state==='Not run'&&!checks.some(result=>result.name===c.name)).map(c=>({...c,state:'Passed' as const,detail:'executed'})),...checks]};return workflowValidationPresentation(w,true)}
describe('honest accepted-candidate validation presentation',()=>{
  it('shows actual configuration before execution without inferring tests from package scripts or build',()=>{
    const w=workflow({build:['run','build','--','src/card']});w.baseline['package.json']=JSON.stringify({scripts:{test:'node --test'}});
    expect(configuredWorkflowChecks(w).map(c=>[c.name,c.state])).toEqual([['typecheck','Not configured'],['build','Not run'],['test','Not configured']]);
    expect(configuredWorkflowChecks(w)[1].command).toBe('"npm" "run" "build" "--" "src/card"');expect(workflowValidationPresentation(w,false).status).toBe('Not run');
  });
  it('reports full and limited results separately, preserves unknown coverage, and never relabels missing checks Passed',()=>{
    const full=workflow(),checks=configuredWorkflowChecks(full).map(c=>({...c,state:'Passed' as const,detail:'executed'}));
    expect(recorded(full,checks).status).toBe('Passed');
    const limited=workflow({build:['run','build']}),result=recorded(limited,[{name:'build',state:'Passed',detail:'vite built'},{name:'scanner',state:'Passed',detail:'rescan'}]);
    expect(result.status).toBe('Limited validation');expect(result.explanation).toContain('build (Passed)');expect(result.explanation).toContain('typecheck, test');expect(result.coverage).toBe('Unknown');expect(result.checks.find(c=>c.name==='test')?.state).toBe('Not configured');expect(result.checks.find(c=>c.name==='scanner')?.kind).toBe('scanner');
  });
  it('keeps command failure, unavailable evidence, start errors and stale validation distinct',()=>{
    for(const state of ['Failed','Unavailable','Error'] as const){const w=workflow();expect(recorded(w,[{name:'test',state,detail:'actual diagnostic'}]).status).toBe(state==='Failed'?'Failed':'Unavailable');expect(workflowValidationPresentation(w,false).explanation).toContain('stale');}
  });
  it('reports technical validation unavailable when no commands exist even with successful scanner/runtime checks',()=>{
    const result=recorded(workflow({}),[{name:'scanner',state:'Passed',detail:'rescan'},{name:'runtime-people-ltr',state:'Passed',detail:'actual target'}]);expect(result.status).toBe('Technical validation unavailable');expect(result.explanation).toContain('executed: none');expect(result.checks.filter(c=>c.kind==='project').every(c=>c.state==='Not configured')).toBe(true);
  });
  it('never treats missing required results or hashes as successful evidence',()=>{const w=workflow();recorded(w,[]);w.validation!.checks=w.validation!.checks.filter(c=>c.name!=='test');expect(workflowValidationPresentation(w,true).status).toBe('Unavailable');expect(workflowValidationPresentation(w,true).explanation).toContain('test');w.validation!.hashes={};expect(workflowValidationPresentation(w,true).status).toBe('Unavailable');});
  it('requires explicit evidence for Not applicable and keeps historical missing-command records honest without mutating them',()=>{
    const w=workflow({build:['run','build']});const config=JSON.parse(w.baseline['rtl-project.config.json']);config.validationExclusions={typecheck:'JavaScript project; explicitly excluded by owner'};w.baseline['rtl-project.config.json']=JSON.stringify(config);
    expect(configuredWorkflowChecks(w).find(c=>c.name==='typecheck')).toMatchObject({state:'Not applicable',detail:config.validationExclusions.typecheck});
    recorded(w,[{name:'test',state:'Unavailable',detail:'No configured project check'},{name:'build',state:'Passed',detail:'built'}]);const before=JSON.stringify(w.validation);expect(workflowValidationPresentation(w,true).checks.find(c=>c.name==='test')?.state).toBe('Not configured');expect(JSON.stringify(w.validation)).toBe(before);
  });
});
