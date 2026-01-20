import { test, expect } from './fixtures'
import { computerActive, verifyMessage, yourMove } from './helpers'

test.describe('Checkers Game Messages', () => {
  test('Display initial select orange piece message', async ({ page }) => {
    await verifyMessage(page, 'Select an orange piece to move.')
  })

  test('Click blue piece show next message', async ({ page }) => {
    await page.locator('img[name="space55"]').click()
    await verifyMessage(page, 'Click on your orange piece, then click where you want to move it.')
  })

  test('“Make a move.” message after a valid move', async ({ page }) => {
    // Last step of yourFirstMove verifies this message
    await yourMove(page, 'space42', 'space33')
  })
  test('"Move diagonally only." message', async ({ page }) => {
    await yourMove(page, 'space42', 'space33')

    await expect(computerActive(page)).not.toBeVisible()

    // Verify space33 has src="you1.gif"
    const space33 = page.locator('img[name="space33"]')
    await expect(space33).toHaveAttribute('src', 'you1.gif')
    await space33.click()

    // Get space53 and click (invalid move - not diagonal)
    const space53 = page.locator('img[name="space53"]')
    await space53.click()

    // Verify message for invalid move
    await verifyMessage(page, 'Move diagonally only.')
  })

  test('Please wait message', async ({ page }) => {
    await yourMove(page, 'space42', 'space33')

    // Verify space33 has src="you1.gif"
    const space33 = page.locator('img[name="space33"]')
    await expect(space33).toHaveAttribute('src', 'you1.gif')
    await space33.click()

    // Get space53 and click
    const space42 = page.locator('img[name="space42"]')
    await space42.dblclick()

    // Verify Please wait message
    await verifyMessage(page, 'Please wait.')
  })

  test('This is an invalid move message', async ({ page }) => {
    await verifyMessage(page, 'Select an orange piece to move.')

    // Verify space51 has src="you1.gif"
    const space51 = page.locator('img[name="space51"]')
    await expect(space51).toHaveAttribute('src', 'you1.gif')
    await space51.click()
    // Note: yourFirstMove helper is checking the UI img src changes from you1.gif to you2.gif
    await expect(space51).toHaveAttribute('src', 'you2.gif')

    // Attempt an invalid move: pick diagonal square > 1 space away
    const invalidDestination = page.locator('img[name="space24"]')
    await invalidDestination.click()

    // Verify the invalid move message appears
    await verifyMessage(page, 'This is an invalid move.')
  })
})
