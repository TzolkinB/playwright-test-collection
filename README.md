![CI/CD workflow](https://github.com/TzolkinB/playwright-test-collection/actions/workflows/playwright.yml/badge.svg)

# playwright-test-collection

Playwright Tests for Checkers Game UI and Deck of Cards API

- [Checkers Game](https://www.gamesforthebrain.com/game/checkers/)
- [Deck of Cards API](https://www.deckofcardsapi.com/)

## Folder Structure

- tests/
  - [deckofcards.spec.js](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/deckofcards.spec.js): API tests for API endpoints provided by "Deck of Cards API" website
  - [checkers.spec.js](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/checkers.spec.js): Integration tests for UI and Navigation elements of the "Checkers Game" page
  - [checkersMessages.spec.js](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/checkersMessages.spec.js): Integration tests for the messages displayed to the user on the "Checkers Game" page
  - [helpers.js](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/helpers.js): Collection of helper functions used in one or more files

---

TODO:

- separate tests into corresponding api, integration folders?
