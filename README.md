![CI/CD workflow](https://github.com/TzolkinB/playwright-test-collection/actions/workflows/playwright.yml/badge.svg)

# playwright-test-collection

Playwright Tests for Checkers Game UI and Deck of Cards API

- [Checkers Game](https://www.gamesforthebrain.com/game/checkers/)
- [Deck of Cards API](https://www.deckofcardsapi.com/)

## Folder Structure

- tests/
  - [deckofcards.spec.ts](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/deckofcards.spec.ts): API tests for API endpoints provided by "Deck of Cards API" website
  - [checkers.spec.ts](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/checkers.spec.ts): Integration tests for UI and Navigation elements of the "Checkers Game" page
  - [checkersMessages.spec.ts](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/checkersMessages.spec.ts): Integration tests for the messages displayed to the user on the "Checkers Game" page
  - [helpers.ts](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/helpers.ts): Collection of helper functions and const used in one or more files
  - [fixtures.ts](https://github.com/TzolkinB/playwright-test-collection/blob/master/tests/fixtures.ts): checkersPage fixture, loads url and removes ad iframe

### Checkers

|  |    |    |    |    |    |    |   |
|:-| :-:| :-:| :-:| :-:| :-:| :-:| -:|
|🔵77 |    |🔵57|     |🔵37|    |🔵17|    |
|     |🔵66|    |🔵46 |    |🔵26|    |🔵06| 
|🔵75|     |🔵55|     |🔵35|    |🔵15|    |
|    |64   |    |44   |     |24  |    |04  |
|73  |     |53  |     |33   |    |13  |    |   
|    |🟠62|    |🟠42|     |🟠22 |    |🟠02|
|🟠71|    |🟠51|    |🟠31 |     |🟠11|    |
|    |🟠60|    |🟠40|     |🟠20 |    |🟠00|


---

TODO/IDEAS:

- move strings into shared folder, enum structure?
- separate tests into corresponding api, integration folders?
