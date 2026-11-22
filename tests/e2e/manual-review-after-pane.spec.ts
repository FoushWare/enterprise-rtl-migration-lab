import {test,expect,type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {enterReview} from './enter-review';
const origin='http://127.0.0.1:4318';
/** Hash every project file except installed dependencies and Vite caches. */
function projectDigest(root:string){const h=createHash('sha256');const walk=(d:string)=>{for(const n of readdirSync(d).sort()){if(n==='node_modules'||n==='.vite')continue;const p=join(d,n);if(statSync(p).isDirectory())walk(p);else h.update(p.slice(root.length)+'\0').update(readFileSync(p))}};walk(root);return h.digest('hex')}
test('manual-review findings keep both panes and a supported finding previews before approval, without touching source',async({page,request})=>{
 const env=JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT!,'utf8'));
 if(!/\/rtl-foundations\./.test(env.project))throw Error('DISPOSABLE_ONLY');
 const report=JSON.parse(readFileSync(join(env.dashboard,'rtl-report.json'),'utf8'));
 const find=(selector:string)=>{const f=report.findings.find((x:any)=>typeof x.context==='string'&&x.context.endsWith('/'+selector)&&x.path==='src/lab.css');if(!f)throw Error('FINDING_NOT_FOUND '+selector);return f};
 const before=projectDigest(env.project),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 const health=await request.get(origin+'/health').then(r=>r.json());expect(health.projectRoot).toBe(env.project);
 const accepted=async()=>{const r=await request.get(origin+'/review/workflows?'+new URLSearchParams({inputDigest:report.inputDigest,policyDigest:report.policyDigest,mode:'one-by-one'})).then(r=>r.json());return (r.workflow?.entries||[]).filter((e:any)=>e.decision==='Accepted').length};
 const visible=(l:ReturnType<Page['locator']>)=>expect(l).toBeVisible();
 const open=async(f:any)=>{await page.goto('?finding='+encodeURIComponent(f.id),{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof (window as any).rtlDashboardVisibleFindings==='function');await enterReview(page);await expect(page.locator('.component-before .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000})};
 const direction=async(mode:'LTR'|'RTL')=>{await page.locator('.component-review .component-toolbar').getByRole('button',{name:mode,exact:true}).click();await expect(page.locator('.component-before iframe')).toHaveAttribute('src',new RegExp('direction='+mode.toLowerCase()),{timeout:30000})};
 const reasonOf=(f:any)=>String(f.rationale).slice(0,40);

 for(const selector of ['.topbar nav','.fixed-right']){
  const f=find(selector);await open(f);
  for(const mode of ['LTR','RTL'] as const){
   await direction(mode);
   // Code comparison: both cards visible, After states the manual-review reason.
   await visible(page.locator('.before-card'));await visible(page.locator('.after-card'));
   await expect(page.locator('.after-card h3')).toHaveText('After (Manual review required)');
   await expect(page.locator('.after-card pre')).toContainText('Manual review required');await expect(page.locator('.after-card pre')).toContainText(reasonOf(f));
   await expect(page.locator('.after-card h3')).not.toContainText(/suggested fix|supported candidate/i);
   // Component Review: both panes visible, After explains why it has no preview.
   await visible(page.locator('.component-before'));await visible(page.locator('.component-after'));
   await expect(page.locator('.component-after .embedded-state')).toContainText('Manual review required');await expect(page.locator('.component-after .embedded-state')).toContainText(reasonOf(f));
   await expect(page.locator('.component-after iframe')).toHaveCount(0);
   expect(await accepted()).toBe(0);await expect(page.getByText('0 accepted',{exact:false}).first()).toBeVisible();
  }
 }

 const banner=find('.edge-bar');await open(banner);
 await direction('RTL');
 await expect(page.locator('.after-card h3')).toHaveText('After (Supported candidate)');await expect(page.locator('.after-card pre')).toContainText('border-inline-start');
 await visible(page.locator('.component-before'));await visible(page.locator('.component-after'));
 await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-context-status','verified',{timeout:30000});
 await expect(page.locator('.component-after iframe')).toHaveAttribute('src',/direction=rtl/);await expect(page.locator('.component-before iframe')).toHaveAttribute('src',/direction=rtl/);
 await expect(page.locator('.component-after')).toContainText('Preview ready');await expect(page.locator('.component-after')).toContainText('Pending approval');
 // Preview is shown before approval: the entry is still pending and nothing was accepted.
 expect(await accepted()).toBe(0);await expect(page.getByText('0 accepted',{exact:false}).first()).toBeVisible();

 expect(projectDigest(env.project)).toBe(before);expect(errors).toEqual([]);
});
