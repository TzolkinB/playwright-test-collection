import { test, expect } from './fixtures'
import { computerActive, verifyLink, verifyMessage, yourMove } from './helpers'

test.describe('Checkers Game UI', () => {
  test('Should have header, board & correct links', async ({ page, request }) => {
    const rulesHref = 'https://en.wikipedia.org/wiki/English_draughts#Starting_position'
    const board = page.locator('.content').locator('#board')
    const boardLinks = page.locator('.footnote').getByRole('link')
    const nav = page.locator('#navigation')
    const logo = nav.locator('.mainLogo')
    await expect(page.getByRole('heading', { level: 1, name: 'Checkers' })).toBeVisible()

    await expect(board.locator('img[src="you1.gif"]')).toHaveCount(12) // Player pieces

    await expect(boardLinks).toHaveCount(2)
    await verifyLink(boardLinks, 'Restart...', './')
    await verifyLink(boardLinks, 'Rules', rulesHref)

    await request.get(rulesHref).then((response) => {
      expect(response.status()).toBe(200)
    })

    // Navigation assertions
    await expect(logo.locator('a')).toHaveAttribute('href', '/')

    await expect(logo.locator('img')).toHaveAttribute('src', '/image/logo.png')
    await expect(logo.locator('img')).toHaveAttribute('alt', 'Games for the Brain')
  })

  test('Should have footer', async ({ page }) => {
    const nav = page.locator('#navigation')
    const footerLinks = nav.locator('#footer').getByRole('link')
    const expectedLinks = [
      { text: 'Games for the Brain', href: '/' },
      { text: 'Bonus Room', href: '/bonus/' },
      { text: 'About', href: '/about/' },
    ]
    await expect(footerLinks).toHaveCount(3, { timeout: 10000 })

    for (const link of expectedLinks) {
      await verifyLink(footerLinks, link.text, link.href)
    }
  })

  test('Restart game', async ({ page }) => {
    const defaultEmptySpaces = ['73', '53', '33', '13', '64', '44', '24', '04']
    await yourMove(page, 'space42', 'space33')
    await expect(computerActive(page)).not.toBeVisible()
    await yourMove(page, 'space33', 'space24')
    await expect(computerActive(page)).not.toBeVisible()
    await yourMove(page, 'space62', 'space53')

    await page.getByRole('link', { name: 'Restart...' }).click()

    // Verify default gray squares and initial game message
    await verifyMessage(page, 'Select an orange piece to move.')

    for (const space of defaultEmptySpaces) {
      await expect(page.locator(`img[name="space${space}"]`)).toHaveAttribute('src', 'gray.gif')
    }
  })

  //TODO: king piece, (computer blue) me1k.gif
  // cam be done in 4 moves

  //TODO: test all 35? game links in "#nagivation > .mainNavigation"
})
