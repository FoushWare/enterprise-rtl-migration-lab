import { expect, test } from '@playwright/test';

test('keeps the workspace usable across desktop, tablet, and mobile widths', async ({ page }) => {
  for (const width of [1440, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: width < 600 ? 900 : 1000 });
    await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
    await expect(page.getByRole('textbox', { name: 'Search findings' })).toBeVisible();
    await expect(page.getByText('Findings: search and filters')).toBeVisible();
    const overflow = await page.evaluate(() => ({ page: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), viewport: window.innerWidth, offenders: [...document.querySelectorAll<HTMLElement>('*')].filter((x) => x.scrollWidth > document.documentElement.clientWidth).slice(0, 5).map((x) => `${x.className}:${x.scrollWidth}`) }));
    expect(overflow.page, `unexpected page overflow at ${width}px: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(overflow.viewport);
    await page.locator('.finding-list .finding').first().click();
    await expect(page.getByText('Review Workspace')).toBeVisible();
    if (width <= 760) {
      await expect(page.locator('.mobile-back')).toBeVisible();
      await page.locator('.mobile-back').click();
      await expect(page.locator('.finding-list .finding.selected')).toBeFocused();
    }
    await page.screenshot({ path: `/private/tmp/phase31-${width}.png`, fullPage: true });
  }
});
