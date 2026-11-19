import {test,expect} from '@playwright/test';
import {enterReview} from './enter-review';

test('compact workspace preserves real previews and requires explicit lost-target reselection',async({page},info)=>{
 test.setTimeout(90000);
 await page.goto('?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30');
 await enterReview(page,'one-by-one');
 const after=page.locator('.component-after iframe'),before=page.locator('.component-before iframe');
 await expect(after).toBeVisible();
 await expect(page.locator('.component-after .embedded-state')).toHaveAttribute('data-preparation-state','ready',{timeout:30000});
 const stats=page.getByRole('button',{name:/Statistics ·/});
 await expect(stats).toHaveAttribute('aria-expanded','true');
 const height=await page.locator('.summary').evaluate(n=>n.getBoundingClientRect().height);
 expect(height).toBeLessThan(90);
 await stats.click();await expect(stats).toHaveAttribute('aria-expanded','false');await expect(page.locator('.summary')).toBeHidden();
 await stats.press('Enter');await expect(page.locator('.summary')).toBeVisible();
 const boxes=await page.locator('.meta,.review-session-toolbar,.code-scroll').evaluateAll(ns=>ns.map(n=>({top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom})));
 expect(boxes[0].bottom).toBeLessThanOrEqual(boxes[1].top);expect(boxes[1].bottom).toBeLessThanOrEqual(boxes[2].top);
 await expect(page.locator('.analysis-status')).not.toContainText('Included in candidate');
 await page.locator('.component-toolbar').getByRole('button',{name:'RTL',exact:true}).click();
 await expect(page.locator('.component-toolbar [data-direction=rtl]')).toHaveAttribute('aria-pressed','true');
 await expect(page.frameLocator('.component-before iframe').locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.frameLocator('.component-after iframe').locator('html')).toHaveAttribute('dir','rtl');
 await page.getByLabel('Original target instance',{exact:true}).selectOption('1');
 await page.getByLabel('Candidate target instance',{exact:true}).selectOption('1');
 // A tall test-only DOM extension makes the frame-scroll assertion meaningful.
 for(const side of ['before','after'])await page.frameLocator('.component-'+side+' iframe').locator('body').evaluate(n=>{n.style.minHeight='3000px';window.scrollTo(0,200)});
 const handles=await Promise.all([before.elementHandle(),after.elementHandle()]);
 const read=async()=>({urls:await page.locator('.component-compare iframe').evaluateAll(ns=>ns.map(n=>(n as HTMLIFrameElement).src)),scrolls:await Promise.all(['before','after'].map(side=>page.frameLocator('.component-'+side+' iframe').locator('html').evaluate(()=>window.scrollY))),targets:await page.locator('.context-instance').evaluateAll(ns=>ns.map(n=>(n as HTMLSelectElement).value)),preparation:await page.locator('.component-after .embedded-state').getAttribute('data-preparation-state')});
 const state=await read();expect(state.scrolls.every(y=>y>100)).toBe(true);
 for(const name of ['Files','Findings','Files','Findings']){await page.getByRole('button',{name,exact:true}).click();expect(await read()).toEqual(state);for(let i=0;i<2;i++)expect(await handles[i]!.evaluate((n,side)=>n===document.querySelector('.component-'+side+' iframe'),i?'after':'before')).toBe(true)}
 await page.evaluate(()=>{for(const key of Object.keys(sessionStorage))if(key.startsWith('rtl-context-target:')&&key.includes('candidate'))sessionStorage.setItem(key,JSON.stringify({targetKey:'removed-person',index:1,label:'Removed'}))});
 await page.reload();
 const target=page.getByLabel('Candidate target instance',{exact:true});
 await expect(target).toHaveValue('');await expect(page.locator('.component-after .embedded-state')).toContainText('Previous target could not be restored. Select a target.');
 await page.waitForTimeout(1800);await expect(target).toHaveValue('');await expect(after).toBeVisible();
 await expect(page.frameLocator('.component-after iframe').locator('.rtl-context-highlight')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('lost-target.png')});
 await target.selectOption('1');await expect(target).toHaveValue('1');await expect(page.frameLocator('.component-after iframe').locator('.rtl-context-highlight')).toHaveAttribute('data-target-index','1');
 await page.getByRole('button',{name:'Expand',exact:true}).click();await expect(page.getByRole('dialog',{name:'Live application preview'})).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:info.outputPath('refined-workspace.png'),fullPage:true});
 await page.setViewportSize({width:480,height:720});await page.evaluate(()=>scrollTo(0,0));
 expect(await page.locator('.finding-title-wrap').evaluate(n=>n.getBoundingClientRect().width)).toBeGreaterThan(250);
 const statsBounds=(await stats.boundingBox())!;expect(statsBounds.x).toBeGreaterThanOrEqual(0);expect(statsBounds.x+statsBounds.width).toBeLessThanOrEqual(480);
 await expect(page.frameLocator('.component-after iframe').locator('.contact-name').first()).toBeVisible();
 await page.screenshot({path:info.outputPath('refined-narrow.png'),fullPage:true});
});
