import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  checkersPage: [
    async ({ page }, use) => {
      const startTime = Date.now();

      await page.goto('https://www.gamesforthebrain.com/game/checkers/', {
      });

      // Remove ad iframe immediately
      await page.evaluate(() => {
        const adFrame =
          document.querySelector('iframe[src*="ad"]') ||
          document.querySelector('iframe');
        if (adFrame) adFrame.remove();
      });

      await expect(page).toHaveURL(/checkers/);

      const loadTime = Date.now() - startTime;
      console.log(`Page loaded in ${loadTime}ms`);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
