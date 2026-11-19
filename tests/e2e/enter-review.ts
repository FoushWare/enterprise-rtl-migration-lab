import {expect,type Page} from '@playwright/test';
/** Existing saved workflows reopen directly; changing mode still uses the explicit chooser. */
export async function enterReview(page:Page,mode='one-by-one') {
 await expect(page.locator('.workflow-screen:visible,.workflow-summary:visible').first()).toBeVisible();
 if(!await page.locator('.workflow-screen').count()){
  const saved=await page.evaluate(()=>localStorage.getItem('rtl-review-workflow'));
  if(saved===mode){await expect(page.locator('.session-identity')).toHaveAttribute('title',mode==='one-by-one'?'One by one review':'Apply first review');return}
  await page.getByRole('button',{name:'Change review workflow',exact:true}).click();
 }
 await page.getByRole('button',{name:mode==='one-by-one'?'Start manual review':'Apply to candidate & review',exact:true}).click();
}

