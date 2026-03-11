# Project Guidelines

## Code Style

- Use TypeScript for all test and helper code under `tests/`.
- Follow existing Playwright patterns: `test.describe`, explicit assertions, and helper reuse from `tests/helpers.ts`.
- Keep async Playwright actions awaited; lint rules enforce promise safety.
- Preserve existing naming style (`camelCase` helpers, descriptive test titles starting with "Should ...").

## Architecture

- This repository is a Playwright test suite (no app source) targeting:
  - Checkers UI at https://www.gamesforthebrain.com/game/checkers/
  - Deck of Cards API at https://www.deckofcardsapi.com/
- Core boundaries:
  - `tests/*.spec.ts`: primary suites (UI, messages, API)
  - `tests/regression/*.spec.ts`: regression-focused flows
  - `tests/fixtures.ts`: shared auto fixture for Checkers page setup
  - `tests/helpers.ts`: reusable assertions and game interaction helpers
- `checkersPage` fixture is automatic (`{ auto: true }`), so tests generally should not reimplement page bootstrap logic.

## Build And Test

- Install dependencies: `npm install`
- Run full validation + tests: `npm test`
- Typecheck + test linting only: `npm run pretest`
- Lint all files: `npm run lint`
- Playwright config:
  - Browsers: Chromium, Firefox, WebKit
  - Retries: 2 on CI, 0 locally
  - Workers: 1 on CI, 3 locally

## Conventions

- Prefer extending existing helpers before introducing new inline selector logic.
- Keep selectors resilient and consistent with current style (`img[name=".."]`, `#message`, suffix `src` checks).
- Reuse `verifyMessage`, `verifyLink`, and `yourMove` where applicable to avoid duplicate logic.
- When adding Checkers tests, account for asynchronous game state changes with explicit expectation timeouts.

## Pitfalls

- Tests depend on external networked targets; intermittent slowness is expected.
- Ads/iframes can interfere with UI tests; preserve fixture behavior that removes ad iframes.
- Avoid assumptions that game responses are immediate; maintain reliable waits/assertions.
- Do not introduce `test.only`; CI forbids it.

## Key Files

- `package.json`: scripts, lint-staged, and toolchain dependencies
- `playwright.config.ts`: browser matrix, retries/workers, shared timeouts
- `tests/fixtures.ts`: automatic Checkers setup and URL validation
- `tests/helpers.ts`: canonical reusable helper behavior
- `README.md`: project scope and suite overview
