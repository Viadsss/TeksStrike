import type { CardData, Position } from "./types";

export class Enemy {
  public cards: CardData[] = [];
  public selectedCard: CardData | null = null;
  public selectedCardId: number | null = null;
  public selectedCardInitialPosition: Position | null = null;
  public isAnimating: boolean = false;

  constructor(cards: CardData[] = []) {
    this.cards = cards;
  }

  // Add a card to the enemy's hand
  addCard(card: CardData): void {
    this.cards.push(card);
  }

  // Remove a card from the enemy's hand by ID
  removeCard(cardId: number): void {
    this.cards = this.cards.filter((card) => card.id !== cardId);
  }

  // Select a card for battle
  selectCard(card: CardData, initialPosition?: Position): void {
    this.selectedCard = card;
    this.selectedCardId = card.id;
    this.selectedCardInitialPosition = initialPosition || null;
    this.isAnimating = true;
  }

  // Deselect the current card
  deselectCard(): void {
    this.selectedCard = null;
    this.selectedCardId = null;
    this.selectedCardInitialPosition = null;
    this.isAnimating = false;
  }

  // Get cards that are still in hand (not selected)
  getHandCards(): CardData[] {
    if (this.selectedCardId === null) {
      return this.cards;
    }
    return this.cards.filter((card) => card.id !== this.selectedCardId);
  }

  // Check if a specific card is selected
  isCardSelected(cardId: number): boolean {
    return this.selectedCardId === cardId;
  }

  // Get the selected card with its metadata
  getSelectedCardData(): {
    card: CardData;
    id: number;
    initialPosition?: Position;
  } | null {
    if (!this.selectedCard) return null;

    return {
      card: this.selectedCard,
      id: this.selectedCard.id,
      initialPosition: this.selectedCardInitialPosition || undefined,
    };
  }

  // Set animation state
  setAnimating(isAnimating: boolean): void {
    this.isAnimating = isAnimating;
  }

  // Reset enemy state
  reset(): void {
    this.selectedCard = null;
    this.selectedCardId = null;
    this.selectedCardInitialPosition = null;
    this.isAnimating = false;
  }

  // AI: Automatically select a random card
  selectRandomCard(gameRect?: DOMRect, enemyAreaRect?: DOMRect): void {
    const availableCards = this.getHandCards();
    if (availableCards.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const randomCard = availableCards[randomIndex];

    // Calculate initial position if rects are provided
    let initialPosition: Position | undefined;
    if (gameRect && enemyAreaRect) {
      initialPosition = {
        x: gameRect.width / 2 - (enemyAreaRect.left - gameRect.left) - 62.5,
        y: 50 - (enemyAreaRect.top - gameRect.top),
      };
    }

    this.selectCard(randomCard, initialPosition);
  }

  // Get a random card from hand
  getRandomCard(): CardData | null {
    const availableCards = this.getHandCards();
    if (availableCards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
  }
}
