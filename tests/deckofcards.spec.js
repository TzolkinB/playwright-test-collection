// tests/deckofcards.spec.js
import { test, expect } from '@playwright/test'

const base = 'https://www.deckofcardsapi.com'
test.describe('Deck of Cards API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(base)
    await expect(page).toHaveURL(/deckofcardsapi.com/)
  })

  const successStatusObjBody = async (response) => {
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(typeof body).toBe('object')
    expect(body).not.toBeNull()
  }

  const getCardCodes = (cards) => cards.map((c) => c.code).join(',')

  test('Shuffle, draw, pile & reshuffle flow', async ({ request }) => {
    // STEP 1: Create and shuffle a new deck (test /deck/new/shuffle endpoint)
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/?deck_count=1`)
    await successStatusObjBody(shuffle)
    const { deck_id: deckID, shuffled, remaining } = await shuffle.json()
    expect(shuffled).toBe(true)
    expect(remaining).toBe(52)

    // STEP 2: Draw 12 cards (test /draw endpoint with count parameter)
    const draw12 = await request.get(`${base}/api/deck/${deckID}/draw/?count=12`)
    await successStatusObjBody(draw12)
    const { cards, remaining: remainingAfterDraw } = await draw12.json()
    expect(cards.length).toBe(12)
    expect(remainingAfterDraw).toBe(40)

    // STEP 3: Test "add to pile" API by selecting 8 cards from the 12 drawn
    // This tests the pile API feature: /pile/{pile_name}/add/?cards=AS,2S
    const pileCardCodes = getCardCodes(cards.slice(0, 8))

    // Set the 8 cards into a pile
    const addToPile = await request.get(
      `${base}/api/deck/${deckID}/pile/my_pile/add/?cards=${pileCardCodes}`,
    )
    await successStatusObjBody(addToPile)
    const addToPileResp = await addToPile.json()
    expect(addToPileResp).toBeInstanceOf(Object)
    expect(addToPileResp.piles.my_pile.remaining).toBe(8)

    // STEP 4: Verify pile contents match what we added (test /pile/list endpoint)
    const listPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/list/`)
    await successStatusObjBody(listPile)
    const { piles } = await listPile.json()
    const listPileCodes = getCardCodes(piles.my_pile.cards)
    expect(listPileCodes).toEqual(pileCardCodes)

    // STEP 5: Shuffle the pile (test /pile/shuffle endpoint)
    const shufflePile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/shuffle/`)
    await successStatusObjBody(shufflePile)

    // NOTE: Shuffle API response doesn't include cards, so we must list separately
    const listPileAfterShuffle = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/list/`)
    await successStatusObjBody(listPileAfterShuffle)
    const { piles: pilesAfterShuffle } = await listPileAfterShuffle.json()
    const listPileCodesAfterShuffle = getCardCodes(pilesAfterShuffle.my_pile.cards)
    expect(listPileCodesAfterShuffle).not.toEqual(pileCardCodes)

    // STEP 6: Return cards not in pile back to deck (test /return endpoint)
    const returnToDeck = await request.get(`${base}/api/deck/${deckID}/return/`)
    await successStatusObjBody(returnToDeck)
    const returnToDeckResp = await returnToDeck.json()
    expect(returnToDeckResp.remaining).toBe(44)

    // STEP 7: Reshuffle the main deck (test /shuffle with remaining=true parameter)
    // remaining=true only shuffles cards in main stack, not piles or cards drawn
    const reshuffleDeck = await request.get(`${base}/api/deck/${deckID}/shuffle/?remaining=true`)
    await successStatusObjBody(reshuffleDeck)
    const { shuffled: reshuffled, remaining: remainingAfterReshuffle } = await reshuffleDeck.json()
    expect(reshuffled).toBe(true)
    expect(remainingAfterReshuffle).toBe(44)

    // STEP 8: Draw 2 cards from bottom of pile (test /pile/draw with bottom=true parameter)
    const drawFromPile = await request.get(
      `${base}/api/deck/${deckID}/pile/my_pile/draw/?count=2&bottom=true`,
    )
    await successStatusObjBody(drawFromPile)
    const { cards: drawnFromPile, piles: remainingPile } = await drawFromPile.json()

    expect(drawnFromPile.length).toBe(2)
    expect(remainingPile.my_pile.remaining).toBe(6)

    // Verify the bottom 2 cards of shuffled pile match what was drawn
    const shuffledPileCardCodes = listPileCodesAfterShuffle.split(',')
    const drawnCardCodes = getCardCodes(drawnFromPile)
    expect(shuffledPileCardCodes.slice(-2).join(',')).toEqual(drawnCardCodes)

    // CLEANUP SUGGESTION: Extract repeated card code mapping to helper function:
    // const getCardCodes = (cards) => cards.map(c => c.code).join(',');
  })

  // Add other it() blocks similarly
  // Partial Deck
  // test('Should GET a partial deck', () => {

  // Brand New Deck
  //test('Should GET a new deck of cards (with/without Jokers)', () => {

  // Back of Card Image
  //test('Should GET the back of card image', () => {

  //test('Should shuffle 2 decks of cards', () => {

  //test('Should draw cards from a new shuffled deck', () => {
})
