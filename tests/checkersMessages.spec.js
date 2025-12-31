// tests/checkersMessages.spec.js
import { test , expect} from '@playwright/test';
import { verifyMessage, yourFirstMove } from './helpers';

test.describe('Checkers Game Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.gamesforthebrain.com/game/checkers/');
    await expect(page).toHaveURL(/checkers/);
    
    // Remove ad iframe that intercepts clicks
    await page.evaluate(() => {
      const adFrame = document.querySelector('iframe[src*="ad"]') || document.querySelector('iframe');
      if (adFrame) adFrame.remove();
    });
  });

  test('Display initial select orange piece message', async ({ page }) => {
    await verifyMessage(page, 'Select an orange piece to move.');
  });

  test('Click blue piece show next message', async ({ page }) => {
    await page.locator('img[name="space55"]').click();
    await verifyMessage(page, 'Click on your orange piece, then click where you want to move it.');
  });

  test('Message “Make a move.” after a valid move', async ({ page }) => {
    // following fails due to element not found
    await yourFirstMove(page, 'space42', 'space33');
    await verifyMessage(page, 'Make a move.');
  });
  test('Move diagonally only message', async ({ page }) => {
    await yourFirstMove(page, 'space42', 'space33');
    await verifyMessage(page, 'Make a move.');
    
    // Brief wait for game to process
    await page.waitForTimeout(500);
    
    // Check that me2.gif does not exist
    const me2 = page.locator('img[src="me2.gif"]');
    await expect(me2).not.toBeVisible();
    
    // Verify space33 has src="you1.gif"
    const space33 = page.locator('img[name="space33"]');
    await expect(space33).toHaveAttribute('src', 'you1.gif');
    await space33.click();
    
    // Get space53 and click (invalid move - not diagonal)
    const space53 = page.locator('img[name="space53"]');
    await space53.click();
    
    // Verify message for invalid move
    await verifyMessage(page, 'Move diagonally only.');
  });

  test('Please wait message', async ({ page }) => {
    await yourFirstMove(page, 'space42', 'space33');
    await verifyMessage(page, 'Make a move.');
    
    // Verify space33 has src="you1.gif"
    const space33 = page.locator('img[name="space33"]');
    await expect(space33).toHaveAttribute('src', 'you1.gif');
    await space33.click();
    
    // Get space53 and click
    const space53 = page.locator('img[name="space53"]');
    await space53.click();
    
    // Verify Please wait message
    await verifyMessage(page, 'Please wait.');
  });

  test('This is an invalid move message', async ({ page }) => {
    await verifyMessage(page, 'Select an orange piece to move.');
    
    // Verify space51 has src="you1.gif"
    const space51 = page.locator('img[name="space51"]');
    await expect(space51).toHaveAttribute('src', 'you1.gif');
    await space51.click();
    // Note: yourFirstMove helper is checking the UI img src changes from you1.gif to you2.gif
    await expect(space51).toHaveAttribute('src', 'you2.gif');

    // Attempt an invalid move: pick diagonal square > 1 space away
    const invalidDestination = page.locator('img[name="space24"]');
    await invalidDestination.click();

    // Verify the invalid move message appears
    await verifyMessage(page, 'This is an invalid move.');
  });
});
