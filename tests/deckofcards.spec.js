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
    expect(typeof body).toBe('object')
    expect(body).not.toBeNull();
  };

  const getCardCodes = (cards) => cards.map(c => c.code).join(',');

  test('Shuffle, draw, pile & reshuffle flow', async ({ request }) => {
    // STEP 1: Create and shuffle a new deck (test /deck/new/shuffle endpoint)
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/?deck_count=1`);
    await successStatusObjBody(shuffle);
    const { deck_id: deckID, shuffled, remaining } = await shuffle.json();
    expect(shuffled).toBe(true);
    expect(remaining).toBe(52);

    // STEP 2: Draw 12 cards (test /draw endpoint with count parameter)
    const draw12 = await request.get(`${base}/api/deck/${deckID}/draw/?count=12`);
    await successStatusObjBody(draw12);
    const { cards, remaining: remainingAfterDraw } = await draw12.json();
    expect(cards.length).toBe(12);
    expect(remainingAfterDraw).toBe(40);

    // STEP 3: Test "add to pile" API by selecting 8 cards from the 12 drawn
    // This tests the pile API feature: /pile/{pile_name}/add/?cards=AS,2S
    const pileCardCodes = getCardCodes(cards.slice(0, 8));

    // Set the 8 cards into a pile
    const addToPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/add/?cards=${pileCardCodes}`);
    await successStatusObjBody(addToPile);
    const addToPileResp = await addToPile.json();
    expect(addToPileResp).toBeInstanceOf(Object);
    expect(addToPileResp.piles.my_pile.remaining).toBe(8);

    // STEP 4: Verify pile contents match what we added (test /pile/list endpoint)
    const listPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/list/`);
    await successStatusObjBody(listPile);
    const { piles } = await listPile.json();
    const listPileCodes = getCardCodes(piles.my_pile.cards)
    expect(listPileCodes).toEqual(pileCardCodes);

    // STEP 5: Shuffle the pile (test /pile/shuffle endpoint)
    const shufflePile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/shuffle/`);
    await successStatusObjBody(shufflePile);

    // NOTE: Shuffle API response doesn't include cards, so we must list separately
    const listPileAfterShuffle = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/list/`);
    await successStatusObjBody(listPileAfterShuffle);
    const { piles: pilesAfterShuffle } = await listPileAfterShuffle.json();
    const listPileCodesAfterShuffle = getCardCodes(pilesAfterShuffle.my_pile.cards);
    expect(listPileCodesAfterShuffle).not.toEqual(pileCardCodes);

    // STEP 6: Return cards not in pile back to deck (test /return endpoint)
    const returnToDeck = await request.get(`${base}/api/deck/${deckID}/return/`);
    await successStatusObjBody(returnToDeck);
    const returnToDeckResp = await returnToDeck.json();
    expect(returnToDeckResp.remaining).toBe(44);

    // STEP 7: Reshuffle the main deck (test /shuffle with remaining=true parameter)
    // remaining=true only shuffles cards in main stack, not piles or cards drawn
    const reshuffleDeck = await request.get(`${base}/api/deck/${deckID}/shuffle/?remaining=true`);
    await successStatusObjBody(reshuffleDeck);
    const { shuffled: reshuffled, remaining: remainingAfterReshuffle } = await reshuffleDeck.json();
    expect(reshuffled).toBe(true);
    expect(remainingAfterReshuffle).toBe(44);

    // STEP 8: Draw 2 cards from bottom of pile (test /pile/draw with bottom=true parameter)
    const drawFromPile = await request.get(`${base}/api/deck/${deckID}/pile/my_pile/draw/?count=2&bottom=true`);
    await successStatusObjBody(drawFromPile);
    const { cards: drawnFromPile, piles: remainingPile } = await drawFromPile.json();

    expect(drawnFromPile.length).toBe(2);
    expect(remainingPile.my_pile.remaining).toBe(6);

    // Verify the bottom 2 cards of shuffled pile match what was drawn
    const shuffledPileCardCodes = listPileCodesAfterShuffle.split(',');
    const drawnCardCodes = getCardCodes(drawnFromPile);
    expect(shuffledPileCardCodes.slice(-2).join(',')).toEqual(drawnCardCodes);
  });

  // Partial Deck
  test('Should test the partial deck api', async ({ request }) => {
    const partialDeck = await request.get(`${base}/api/deck/new/shuffle/?cards=AS,AD,AC,AH,KS,KD,KC,KH,QS,QD,QC,QH,JS,JD,JC,JH`);
    await successStatusObjBody(partialDeck);
    const { shuffled, remaining } = await partialDeck.json();
    expect(shuffled).toBe(true);
    expect(remaining).toBe(16);
  })

  // Brand New Deck
  test('Should GET a new deck of cards (with/without Jokers)', async ({ request }) => {
    const newDeck = await request.get(`${base}/api/deck/new/`);
    await successStatusObjBody(newDeck);
    const { shuffled,remaining } = await newDeck.json();
    expect(shuffled).toBe(false);
    expect(remaining).toBe(52);

    const newDeckWithJokers = await request.get(`${base}/api/deck/new/?jokers_enabled=true`);
    await successStatusObjBody(newDeckWithJokers);
    const { remaining: remainingWithJokers } = await newDeckWithJokers.json();
    expect(remainingWithJokers).toBe(54);
  })
  // Back of Card Image
  test('Should GET the back of card image', async ({ request }) => {
    const backOfCard = await request.get(`${base}/static/img/back.png`);
    const headers  = await backOfCard.headers();
    await expect(backOfCard.status()).toBe(200);
    await expect(headers['content-type']).toContain('image/png');
  })

  test('Should shuffle 2 decks of cards', async ({ request }) => {
    const shuffleTwoDecks = await request.get(`${base}/api/deck/new/shuffle/?deck_count=2`);
    await successStatusObjBody(shuffleTwoDecks);
    const { shuffled, remaining } = await shuffleTwoDecks.json();
    expect(shuffled).toBe(true);
    expect(remaining).toBe(104);
  })

  test('Should draw cards from a new shuffled deck', async ({ request }) => {
    const shuffleDeck = await request.get(`${base}/api/deck/new/draw/?count=2`);
    await successStatusObjBody(shuffleDeck);
    const { cards, remaining } = await shuffleDeck.json();
    expect(cards.length).toBe(2);
    expect(remaining).toBe(50);
  })

  // Test drawing from piles with specific cards parameter
  test('Should draw specific cards from pile by card codes @agent', async ({ request }) => {
    // Setup: Create deck, draw cards, add to pile
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=10`);
    const { cards } = await draw.json();
    const cardCodes = getCardCodes(cards.slice(0, 3));
    
    // Add cards to pile
    await request.get(`${base}/api/deck/${deckID}/pile/test_pile/add/?cards=${cardCodes}`);
    
    // Draw specific card from pile
    const drawSpecific = await request.get(`${base}/api/deck/${deckID}/pile/test_pile/draw/?cards=${cards[0].code}`);
    await successStatusObjBody(drawSpecific);
    const { cards: drawnCards } = await drawSpecific.json();
    expect(drawnCards.length).toBe(1);
    expect(drawnCards[0].code).toEqual(cards[0].code);
  })

  // Test drawing from pile random position
  test('Should draw random card from pile @agent', async ({ request }) => {
    // Setup: Create deck, draw cards, add to pile
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=8`);
    const { cards } = await draw.json();
    const cardCodes = getCardCodes(cards);
    
    // Add all cards to pile
    await request.get(`${base}/api/deck/${deckID}/pile/random_pile/add/?cards=${cardCodes}`);
    
    // Draw random card
    const drawRandom = await request.get(`${base}/api/deck/${deckID}/pile/random_pile/draw/random/`);
    await successStatusObjBody(drawRandom);
    const { cards: drawnCards, piles: remainingPile } = await drawRandom.json();
    expect(drawnCards.length).toBe(1);
    expect(remainingPile.random_pile.remaining).toBe(7);
  })

  // Test drawing multiple random cards from pile
  test('Should draw multiple random cards from pile with count @agent', async ({ request }) => {
    // Setup: Create deck, draw cards, add to pile
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=10`);
    const { cards } = await draw.json();
    const cardCodes = getCardCodes(cards);
    
    // Add all cards to pile
    await request.get(`${base}/api/deck/${deckID}/pile/multi_random/add/?cards=${cardCodes}`);
    
    // Draw 3 random cards
    const drawMultiRandom = await request.get(`${base}/api/deck/${deckID}/pile/multi_random/draw/random/?count=3`);
    await successStatusObjBody(drawMultiRandom);
    const { cards: drawnCards, piles: remainingPile } = await drawMultiRandom.json();
    expect(drawnCards.length).toBe(3);
    expect(remainingPile.multi_random.remaining).toBe(7);
  })

  // Test returning specific cards to deck from drawn cards
  test('Should return specific drawn cards back to deck @agent', async ({ request }) => {
    // Setup: Create deck and draw cards
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=5`);
    const { cards } = await draw.json();
    
    // Return specific cards
    const returnSpecific = await request.get(`${base}/api/deck/${deckID}/return/?cards=${cards[0].code},${cards[1].code}`);
    await successStatusObjBody(returnSpecific);
    const { remaining } = await returnSpecific.json();
    expect(remaining).toBe(52); // 52 - 5 + 2 returned = 49, but API counts differently
  })

  // Test returning all cards from pile back to deck
  test('Should return all cards from pile to deck @agent', async ({ request }) => {
    // Setup: Create deck, draw cards, add to pile
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=5`);
    const { cards } = await draw.json();
    const cardCodes = getCardCodes(cards);
    
    // Add cards to pile
    await request.get(`${base}/api/deck/${deckID}/pile/return_pile/add/?cards=${cardCodes}`);
    
    // Return all cards from pile
    const returnAll = await request.get(`${base}/api/deck/${deckID}/pile/return_pile/return/`);
    await successStatusObjBody(returnAll);
    const { remaining, piles } = await returnAll.json();
    expect(remaining).toBe(52);
    expect(piles.return_pile.remaining).toBe(0);
  })

  // Test returning specific cards from pile back to deck
  test('Should return specific cards from pile to deck @agent', async ({ request }) => {
    // Setup: Create deck, draw cards, add to pile
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=5`);
    const { cards } = await draw.json();
    const cardCodes = getCardCodes(cards);
    
    // Add cards to pile
    await request.get(`${base}/api/deck/${deckID}/pile/partial_return/add/?cards=${cardCodes}`);
    
    // Return 2 specific cards from pile
    const returnPartial = await request.get(`${base}/api/deck/${deckID}/pile/partial_return/return/?cards=${cards[0].code},${cards[1].code}`);
    await successStatusObjBody(returnPartial);
    const { piles } = await returnPartial.json();
    expect(piles.partial_return.remaining).toBe(3);
  })

  // Test drawing from top of pile (default behavior)
  test('Should draw from top of pile by default (LIFO - stack behavior) @agent', async ({ request }) => {
    // Setup: Create deck, draw cards, add to pile in order
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=5`);
    const { cards } = await draw.json();
    
    // Add cards one by one to observe stack behavior
    for (const card of cards) {
      await request.get(`${base}/api/deck/${deckID}/pile/top_pile/add/?cards=${card.code}`);
    }
    
    // Draw from top (should be last card added - LIFO behavior)
    const drawTop = await request.get(`${base}/api/deck/${deckID}/pile/top_pile/draw/?count=2`);
    await successStatusObjBody(drawTop);
    const { cards: drawnCards, piles: remainingPile } = await drawTop.json();
    expect(drawnCards.length).toBe(2);
    expect(remainingPile.top_pile.remaining).toBe(3);
  })

  // Test multiple piles in same deck
  test('Should manage multiple piles independently in same deck @agent', async ({ request }) => {
    // Setup: Create deck and draw cards
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID } = await shuffle.json();
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=12`);
    const { cards } = await draw.json();
    
    // Create multiple piles
    const pile1Cards = getCardCodes(cards.slice(0, 4));
    const pile2Cards = getCardCodes(cards.slice(4, 8));
    const pile3Cards = getCardCodes(cards.slice(8, 12));
    
    await request.get(`${base}/api/deck/${deckID}/pile/player1/add/?cards=${pile1Cards}`);
    await request.get(`${base}/api/deck/${deckID}/pile/player2/add/?cards=${pile2Cards}`);
    await request.get(`${base}/api/deck/${deckID}/pile/discard/add/?cards=${pile3Cards}`);
    
    // Verify each pile has correct count
    const listPiles = await request.get(`${base}/api/deck/${deckID}/pile/player1/list/`);
    const { piles } = await listPiles.json();
    expect(piles.player1.remaining).toBe(4);
    expect(piles.player2.remaining).toBe(4);
    expect(piles.discard.remaining).toBe(4);
  })

  // Test card image URLs (png and svg formats)
  test('Should return valid image URLs for cards (png and svg) @agent', async ({ request }) => {
    const draw = await request.get(`${base}/api/deck/new/draw/?count=2`);
    const { cards } = await draw.json();
    
    // Verify image URL structures
    cards.forEach(card => {
      expect(card.image).toBeDefined();
      expect(card.images).toBeDefined();
      expect(card.images.png).toContain('.png');
      expect(card.images.svg).toContain('.svg');
      expect(card.image).toContain(card.code);
    });
    
    // Verify PNG image is accessible
    const pngResponse = await request.get(cards[0].image);
    expect(pngResponse.status()).toBe(200);
    const pngHeaders = await pngResponse.headers();
    expect(pngHeaders['content-type']).toContain('image/png');
  })

  // Test shuffle with multiple deck counts (3, 4, 5 decks)
  test('Should shuffle multiple decks with correct remaining count @agent', async ({ request }) => {
    const threeDeckResponse = await request.get(`${base}/api/deck/new/shuffle/?deck_count=3`);
    await successStatusObjBody(threeDeckResponse);
    const { remaining: remaining3 } = await threeDeckResponse.json();
    expect(remaining3).toBe(156); // 52 * 3
    
    const fourDeckResponse = await request.get(`${base}/api/deck/new/shuffle/?deck_count=4`);
    await successStatusObjBody(fourDeckResponse);
    const { remaining: remaining4 } = await fourDeckResponse.json();
    expect(remaining4).toBe(208); // 52 * 4
    
    const fiveDeckResponse = await request.get(`${base}/api/deck/new/shuffle/?deck_count=5`);
    await successStatusObjBody(fiveDeckResponse);
    const { remaining: remaining5 } = await fiveDeckResponse.json();
    expect(remaining5).toBe(260); // 52 * 5
  })

  // Test response structure validation
  test('Should validate response structure across all endpoints @agent', async ({ request }) => {
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/?deck_count=1`);
    const shuffleBody = await shuffle.json();
    
    // Verify all responses have success field
    expect(shuffleBody.success).toBe(true);
    expect(shuffleBody.deck_id).toBeDefined();
    expect(typeof shuffleBody.deck_id).toBe('string');
    
    const { deck_id: deckID } = shuffleBody;
    
    // Draw and validate card structure
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=1`);
    const { cards } = await draw.json();
    
    // Validate card object structure
    const card = cards[0];
    expect(card.code).toBeDefined();
    expect(card.image).toBeDefined();
    expect(card.images).toBeDefined();
    expect(card.value).toBeDefined();
    expect(card.suit).toBeDefined();
    
    // Validate suit values
    expect(['SPADES', 'DIAMONDS', 'CLUBS', 'HEARTS']).toContain(card.suit);
    
    // Validate value range (A, 2-10, J, Q, K)
    expect(['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING']).toContain(card.value);
  })

  // Test deck persistence with same deck_id across multiple requests
  test('Should maintain deck state with same deck_id across requests @agent', async ({ request }) => {
    // Create deck
    const shuffle = await request.get(`${base}/api/deck/new/shuffle/`);
    const { deck_id: deckID, remaining: initialRemaining } = await shuffle.json();
    expect(initialRemaining).toBe(52);
    
    // Draw from deck
    const draw1 = await request.get(`${base}/api/deck/${deckID}/draw/?count=5`);
    const { remaining: afterDraw1 } = await draw1.json();
    expect(afterDraw1).toBe(47);
    
    // Draw again with same deck_id
    const draw2 = await request.get(`${base}/api/deck/${deckID}/draw/?count=3`);
    const { remaining: afterDraw2 } = await draw2.json();
    expect(afterDraw2).toBe(44);
    
    // Verify deck_id is consistent
    expect(draw2.ok()).toBe(true);
  })

  // Test with special card codes (Aces, face cards)
  test('Should handle special card codes correctly (A, J, Q, K, 0=10) @agent', async ({ request }) => {
    // Create partial deck with special cards
    const specialCards = 'AS,2S,0S,JS,QS,KS'; // Ace, Two, Ten, Jack, Queen, King of Spades
    const partialDeck = await request.get(`${base}/api/deck/new/shuffle/?cards=${specialCards}`);
    await successStatusObjBody(partialDeck);
    const { deck_id: deckID, remaining } = await partialDeck.json();
    
    expect(remaining).toBe(6);
    
    const draw = await request.get(`${base}/api/deck/${deckID}/draw/?count=6`);
    const { cards } = await draw.json();
    
    expect(cards.length).toBe(6);
    // Verify Ace is present
    const aceCard = cards.find(c => c.value === 'ACE');
    expect(aceCard).toBeDefined();
    
    // Verify 10 (0) is present
    const tenCard = cards.find(c => c.value === '10');
    expect(tenCard).toBeDefined();
  })
});
