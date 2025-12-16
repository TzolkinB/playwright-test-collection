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
    // Shuffle Deck
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/?deck_count=1`);
    await successStatusObjBody(shuffle);
    const { deck_id: deckID, shuffled, remaining } = await shuffle.json();
    expect(shuffled).toBe(true);
    expect(remaining).toBe(52);

    // Draw Cards
    const draw12 = await request.get(`${base}/api/deck/${deckID}/draw/?count=12`);
    await successStatusObjBody(draw12);
    const { cards, remaining: remainingAfterDraw } = await draw12.json();
    expect(cards.length).toBe(12);
    expect(remainingAfterDraw).toBe(40);
    // chatgpt skipped whole section of code setting aside cards and only getting heart cards
    // Out of 12 drawn cards, set aside 8 in a pile
    const pileCards = cards.slice(0, 8).map(card => card.code).join(',');
    const heartCards = cards.filter(card => card.suit === 'HEARTS');
    // console.log('Heart Cards from drawn:', heartCards);
    // console.log('Pile Cards:', pileCards);

    // Add to Pile
    const addToPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/add/?cards=${pileCards}`);
    await successStatusObjBody(addToPile);
    const addToPileResp = await addToPile.json();
    expect(addToPileResp).toBeInstanceOf(Object);
    expect(addToPileResp.piles.my_pile.remaining).toBe(8);

    const listPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/list/`);
    await successStatusObjBody(listPile);
    const { piles } = await listPile.json();
    const listPileCodes = piles.my_pile.cards.map(card => card.code).join(',');
    expect(listPileCodes).toEqual(pileCards);

    // Shuffle Pile
    const shufflePile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/shuffle/`);
    await successStatusObjBody(shufflePile);

    // List Cards in Pile after Shuffle
    const listPileAfterShuffle = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/list/`);
    await successStatusObjBody(listPileAfterShuffle);
    const { piles: pilesAfterShuffle } = await listPileAfterShuffle.json();
    const listPileCodesAfterShuffle = pilesAfterShuffle.my_pile.cards.map(card => card.code).join(',');
    expect(listPileCodesAfterShuffle).not.toEqual(pileCards);

    // Return Cards to Deck
    const returnToDeck = await request.get(`${base}/api/deck/${deckID}/return/`);
    await successStatusObjBody(returnToDeck);
    const returnToDeckResp = await returnToDeck.json();
    expect(returnToDeckResp.remaining).toBe(44);

    // Reshuffle Cards in Deck
    // remaining=true only shuffles cards in main stack, not piles or cards drawn
    const reshuffleDeck = await request.get(`${base}/api/deck/${deckID}/shuffle/?remaining=true`);
    await successStatusObjBody(reshuffleDeck);
    const { shuffled: reshuffled, remaining: remainingAfterReshuffle } = await reshuffleDeck.json();
    expect(reshuffled).toBe(true);
    expect(remainingAfterReshuffle).toBe(44);

    // Draw 2 cards from bottom of pile
    const drawFromPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/draw/?count=2&bottom=true`);
    await successStatusObjBody(drawFromPile);
    const { cards: drawnFromPile, piles: remainingPile } = await drawFromPile.json();
    expect(drawnFromPile.length).toBe(2);
    expect(remainingPile.my_pile.remaining).toBe(6);
    // Verify drawn cards are the last two cards from the original pileCards
    //TODO: the following assertions are failing, need to investigate
    const pileCardsArray = pileCards.split(',');
    expect(drawnFromPile[0].code).toBe(pileCardsArray[6]);
    expect(drawnFromPile[1].code).toBe(pileCardsArray[7]);
    expect(drawFromPile.my_pile.cards.map(card => card.code).join(',')).toBe(listPileCodesAfterShuffle);
    // …Continue converting nested API chain exactly like Cypress
  });

  // Add other it() blocks similarly
});
