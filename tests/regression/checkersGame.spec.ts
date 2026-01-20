import { test, expect } from '../fixtures'
import { computerActive, yourMove } from '../helpers'

// TODO: clean up below code since duplicate actions
// only square number identifiers change
test.skip('Full play, Checkers Game', async ({ page }) => {
  // const userMoves = [{'42', '33'}]
  await yourMove(page, 'space42', 'space33')
  await expect(computerActive(page)).not.toBeVisible()
  await yourMove(page, 'space31', 'space42')
  await expect(computerActive(page)).not.toBeVisible()
  await yourMove(page, 'space22', 'space13')
  await expect(computerActive(page)).not.toBeVisible()
  await yourMove(page, 'space40', 'space31')

  // for (const space of defaultEmptySpaces) {
  // await expect(page.locator(`img[name="space${space}"]`)).toHaveAttribute('src', 'gray.gif')
  // }
})
