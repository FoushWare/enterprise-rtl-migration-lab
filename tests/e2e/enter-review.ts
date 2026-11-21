import {expect,type Page} from '@playwright/test';
/** A top-level entry always makes resume/new explicit; in-review navigation never invokes this. */
export async function enterReview(page:Page,mode='one-by-one') {
 await expect(page.locator('.workflow-screen:visible,.workflow-summary:visible').first()).toBeVisible();
 if(!await page.locator('.workflow-screen').count()){
  if(await page.evaluate(()=>localStorage.getItem('rtl-review-workflow'))===mode)return;
  await page.getByRole('button',{name:'Change review mode',exact:true}).click();
 }
 const resume=page.getByRole('button',{name:'Resume existing review',exact:true});
 const saved=await page.evaluate(()=>localStorage.getItem('rtl-review-workflow'));
 if(saved===mode&&await resume.count())await resume.click();else await page.getByRole('button',{name:mode==='one-by-one'?'Start manual review':'Prepare all & review',exact:true}).click();
 if(mode==='apply-first'){await expect(page.locator('.batch-review')).toBeVisible({timeout:120000});await page.locator('.batch-review').getByRole('button',{name:'View diff',exact:true}).first().click();}
}
