// tests/deckofcards.spec.js
import { test, expect } from '@playwright/test';

const base = 'https://www.deckofcardsapi.com';
test.describe('Deck of Cards API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(base);
    await expect(page).toHaveURL(/deckofcardsapi.com/);
  });

  const successStatusObjBody = async (response) => {
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body).toBe('object');
    expect(await response.body()).toBeInstanceOf(Object);
  };

  test('Shuffle, draw, pile & reshuffle flow', async ({ request }) => {
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/?deck_count=1`);
    await successStatusObjBody(shuffle);
    const { deck_id: deckID, shuffled, remaining } = await shuffle.json();
    expect(shuffled).toBe(true);
    expect(remaining).toBe(52);

    // Draw Cards
    const draw12 = await request.get(`${base}/api/deck/${deckID}/draw/?count=12`);
    await successStatusObjBody(draw12);
    const { cards } = await draw12.json();
    // chatgpt skipped whole section of code setting aside cards and only getting heart cards
    expect(cards.length).toBe(12);
    expect((await draw12.json()).remaining).toBe(40);

    // …Continue converting nested API chain exactly like Cypress
  });

  // Add other it() blocks similarly
});
