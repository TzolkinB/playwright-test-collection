import { test, expect, devices }from '@playwright/test';

// Playwright excels at device emulation
test.use({ ...devices['iPhone 13'] });

test.skip('responsive layout on mobile', async ({ page }) => {
  // const moveTo = page.locator(`img[src="${to}"]`)
  await page.goto('/dashboard');
  
  // Check that the menu is collapsed on mobile
  await expect(page.getByTestId('sidebar')).toHaveClass(/collapsed/);
  
  // Open the mobile menu
  await page.getByTestId('mobile-menu-button').click();
  
  // Check that the menu is now visible
  await expect(page.getByTestId('sidebar')).toBeVisible();
});
