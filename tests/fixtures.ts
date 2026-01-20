import { test as base, expect } from '@playwright/test'

export const test = base.extend<{ checkersPage: void }>({
  checkersPage: [
    async ({ page }, use) => {
      const startTime = Date.now()

      await page.goto('https://www.gamesforthebrain.com/game/checkers/', {})

      // Remove ad iframe immediately
      const adIframe = page.locator('iframe[src*="ad"]')
      await adIframe
        .evaluate((node) => node.remove())
        .catch((error) => {
          console.error('An error occured:', error.message)
        })

      await expect(page).toHaveURL(/checkers/)

      // Log loadtime to monitor network variations with multiple users
      const loadTime = Date.now() - startTime
      console.log(`Page loaded in ${loadTime}ms`)
      await use()
    },
    // Makes the fixture automatic
    // fixture is set up for each test/worker without having to list it directly
    { auto: true },
  ],
})

export { expect }
