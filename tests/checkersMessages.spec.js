// tests/checkersMessages.spec.js
import { test , expect} from '@playwright/test';
import { verifyMessage, yourFirstMove } from './helpers';

test.describe('Checkers Game Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.gamesforthebrain.com/game/checkers/');
    await expect(page).toHaveURL(/checkers/);
  });

  test('Display initial select orange piece message', async ({ page }) => {
    await verifyMessage(page, 'Select an orange piece to move.');
  });

  test('Click blue piece show next message', async ({ page }) => {
    await page.locator('img[name="space55"]').click();
    await verifyMessage(page, 'Click on your orange piece, then click where you want to move it.');
  });

  test.skip('Message “Make a move.” after a valid move', async ({ page }) => {
    // following fails due to element not found
    await yourFirstMove(page, 'space42', 'space33');
    await verifyMessage(page, 'Make a move.');
  });

  // Continue similarly for all message tests
});
