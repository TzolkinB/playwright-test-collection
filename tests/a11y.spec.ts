import { AxeBuilder } from '@axe-core/playwright'
import { test, expect } from './fixtures'
import { AxeResults } from 'axe-core'

test('Checkers webpage accessibility and visual comparison', async ({ page }) => {
  await test.step('should be accessible', async () => {
    // Visual comparison
    await expect(page).toHaveScreenshot()

    // A11y
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    function violationFingerprints(results: AxeResults) {
      const violationFingerprints = results.violations.map((violation) => ({
        rule: violation.id,
        targets: violation.nodes.map((node) => node.target),
      }))

      return JSON.stringify(violationFingerprints, null, 2)
    }

    expect(violationFingerprints(results)).toMatchSnapshot()
  })
})
