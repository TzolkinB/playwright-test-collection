// tests/helpers.js
import { expect } from '@playwright/test';

/**
 * Assert a link’s href and clickability
 */
export async function verifyLink(listOfLinks, text, href) {
  const link = listOfLinks.filter({ hasText: text });
  await expect(link).toHaveAttribute('href', href);
}

/**
 * Assert that a message appears
 */
export async function verifyMessage(page, text) {
  const message = page.locator('#message', { hasText: text });
  await expect(message).toBeVisible();
}

/**
 * Perform a simple “first move” by clicking two squares
 */
export async function yourFirstMove(page, from, to) {
  // Seperate assertions and actions
  // await page.locator(`img[src="${from}"]`).toHaveAttribute('src', 'you1.gif').click();
  const selectedPiece = page.locator(`img[src="${from}"]`)
  const moveTo = page.locator(`img[src="${to}"]`)
  
  await expect(selectedPiece).toHaveAttribute('src', 'you1.gif')
  await selectedPiece.click();
  await expect(selectedPieceelected).toHaveAttribute('src', 'you2.gif')
  await selectedPiece.click();
  
  await expect(moveTo).toHaveAttribute('src', 'gray.gif')
  await moveTo.click();
}
