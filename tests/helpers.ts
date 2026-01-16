import { expect, Locator, Page } from '@playwright/test'

export async function verifyLink(listOfLinks: Locator, text: string, href: string) {
  const link = listOfLinks.filter({ hasText: text })
  await expect(link).toHaveAttribute('href', href, { timeout: 5000 })
}

/**
 * Assert that a message appears
 */
export async function verifyMessage(page: Page, text: string) {
  const message = page.locator('#message')
  await expect(message).toContainText(text, { timeout: 20000 })
}

/**
 * Assert image user sees changes as they make their first move
 */
export async function yourFirstMove(page: Page, from: string, to: string) {
  const selectedPiece = page.locator(`img[name="${from}"]`)
  const moveTo = page.locator(`img[name="${to}"]`)

  await expect(selectedPiece).toHaveAttribute('src', 'you1.gif')
  await selectedPiece.click()
  await expect(selectedPiece).toHaveAttribute('src', 'you2.gif')

  // Destination square should become available
  await expect(moveTo).toHaveAttribute('src', 'gray.gif')
  await moveTo.click()

  // Wait for game to process move
  await expect(page.locator('#message')).toContainText('Make a move.', {
    timeout: 3000,
  })
}
