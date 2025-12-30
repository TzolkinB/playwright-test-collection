// tests/helpers.js
import { expect } from '@playwright/test';

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
 * Assert image user sees changes as they make their first move
 */
export async function yourFirstMove(page, from, to) {
  // Using img[src] selector to test the visual images the user sees
  const selectedPiece = page.locator(`img[src="${from}"]`)
  const moveTo = page.locator(`img[src="${to}"]`)
  
  await expect(selectedPiece).toHaveAttribute('src', 'you1.gif')
  await selectedPiece.click();
  // After click, piece should change visual state
  await expect(selectedPiece).toHaveAttribute('src', 'you2.gif')
  await selectedPiece.click();
  
  // Destination square should become available
  await expect(moveTo).toHaveAttribute('src', 'gray.gif')
  await moveTo.click();
}
