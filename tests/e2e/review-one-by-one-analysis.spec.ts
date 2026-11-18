import {enterReview} from './enter-review';
import {expect,test} from '@playwright/test';
const finding='RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const dashboard='http://127.0.0.1:4320/rtl-report-dashboard.html?finding='+encodeURIComponent(finding);
test('Review One by One analyzes the shared inventory without creating a candidate',async({page})=>{
 const writes:{url:string;body:any}[]=[];page.on('request',r=>{if(r.method()==='POST')writes.push({url:r.url(),body:r.postDataJSON()})});
 await page.goto(dashboard,{waitUntil:'domcontentloaded'});await enterReview(page);await expect(page.locator('.after-card pre')).toHaveText('<bdi dir="auto">{i.id}</bdi>');
 await expect.poll(()=>writes.filter(r=>r.url.endsWith('/review/workflows')).length).toBe(1);expect(writes.filter(r=>/\/sessions|\/change|\/runtime/.test(r.url))).toHaveLength(0);
 const data=await page.locator('#rtl-dashboard-data').textContent().then(s=>JSON.parse(s!));const response=await page.request.get('http://127.0.0.1:4318/review/workflows?'+new URLSearchParams({mode:'one-by-one',inputDigest:data.inputDigest,policyDigest:data.policyDigest})).then(r=>r.json());expect(response.workflow.session).toBeUndefined();expect(response.workflow.entries.find((e:any)=>e.finding.id===finding).applied).toBe(false);
 await page.locator('.finding.selected').click();await expect(page.getByRole('button',{name:'Apply & Preview',exact:true})).toBeEnabled();expect(writes.filter(r=>r.url.endsWith('/review/workflows'))).toHaveLength(1);
});
test('analysis connection failure owns one retry control and repeated retries do not duplicate it',async({page})=>{
 await page.route('**/review/workflows?*',route=>route.abort());await page.goto(dashboard,{waitUntil:'domcontentloaded'});await enterReview(page);const retry=page.getByRole('button',{name:'Retry connection',exact:true});await expect(retry).toHaveCount(1);await expect(page.locator('.analysis-status')).toContainText('COMPANION_UNAVAILABLE');await retry.click();await expect(retry).toHaveCount(1);await expect(page.locator('.analysis-status')).toContainText('COMPANION_UNAVAILABLE');
});
