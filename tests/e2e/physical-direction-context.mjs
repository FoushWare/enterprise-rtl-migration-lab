// Browser regression for a shared selector and intentional local direction overrides.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true});
try {
 const page = await browser.newPage();
 for (const pageDirection of ['ltr','rtl']) {
  for (const [declaration, expected] of [
   ['padding-right:11px', [['ltr','0px','11px'],['rtl','0px','11px']]],
   ['padding-inline-end:11px', [['ltr','0px','11px'],['rtl','11px','0px']]],
  ]) {
   await page.setContent(`<html dir="${pageDirection}"><style>.shared{${declaration}}</style><p class="shared" dir="ltr">LTR</p><p class="shared" dir="rtl">RTL</p></html>`);
   const actual = await page.locator('.shared').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return [s.direction,s.paddingLeft,s.paddingRight]}));
   assert.deepEqual(actual,expected,`${pageDirection} ${declaration}`);
   console.log(JSON.stringify({pageDirection,declaration,actual}));
  }
 }
} finally { await browser.close(); }
