// tests/checkers.spec.js
import { test, expect } from '@playwright/test';
import { verifyLink } from './helpers';

test.describe('Checkers Game UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.gamesforthebrain.com/game/checkers/');
    await expect(page).toHaveURL(/checkers/);
  });

  test('Should have header, board & correct links', async ({ page, request }) => {
    const rulesHref = "https://en.wikipedia.org/wiki/English_draughts#Starting_position"
    await expect(page.locator('h1')).toHaveText('Checkers');

    const board = page.locator('.content').locator('#board');
    await expect(board.locator('img[src="you1.gif"]')).toHaveCount(12); // Player pieces

    const boardLinks = page.locator('.footnote').locator('a')
    await expect(boardLinks).toHaveCount(2);
    await verifyLink(boardLinks, 'Restart...', './')
    await verifyLink(boardLinks, 'Rules', rulesHref)

    await request.get(rulesHref).then(response => {
      expect(response.status()).toBe(200);
    });

    // Navigation assertions
    const nav = page.locator('#navigation');
    const logo = await nav.locator('.mainLogo')
    await expect(logo.locator('a')).toHaveAttribute('href', '/');

    await expect(logo.locator('img')).toHaveAttribute('src', '/image/logo.png');
    await expect(logo.locator('img')).toHaveAttribute('alt', 'Games for the Brain');

    const footerLinks = await nav.locator('#footer').locator('a');
    expect(footerLinks).toHaveCount(3);

    const expectedLinks = [
    { text: 'Games for the Brain', href: '/' },
    { text: 'Bonus Room', href: '/bonus/' },
    { text: 'About', href: '/about/' },
  ];

    expectedLinks.forEach(async (link) => {
      await verifyLink(footerLinks, link.text, link.href);
    })
  });
})
