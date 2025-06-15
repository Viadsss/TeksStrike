import type { Position } from "./types";
import { Card } from "./Card";

export class Enemy {
  public cards: Card[] = [];
  public selectedCard: Card | null = null;
  public selectedCardId: number | null = null;
  public selectedCardInitialPosition: Position | null = null;
  public isAnimating: boolean = false;
  public score: number = 0;

  public modifiedProbability: number = 0;

  constructor(cards: Card[] = []) {
    this.cards = [...cards]; // Create a copy to avoid mutations
  }

  // Create a new instance with updated properties
  private clone(updates: Partial<Enemy> = {}): Enemy {
    const newEnemy = new Enemy();
    newEnemy.cards = [...this.cards];
    newEnemy.selectedCard = this.selectedCard;
    newEnemy.selectedCardId = this.selectedCardId;
    newEnemy.selectedCardInitialPosition = this.selectedCardInitialPosition;
    newEnemy.isAnimating = this.isAnimating;
    newEnemy.score = this.score;

    // Apply updates
    Object.assign(newEnemy, updates);
    return newEnemy;
  }

  winRound(): Enemy {
    return this.clone({ score: this.score + 1 });
  }

  // Add a card to the enemy's hand
  addCard(card: Card): Enemy {
    return this.clone({ cards: [...this.cards, card] });
  }

  // Remove a card from the enemy's hand by ID
  removeCard(cardId: number): Enemy {
    return this.clone({
      cards: this.cards.filter((card) => card.id !== cardId),
    });
  }

  // Select a card for battle
  selectCard(card: Card, initialPosition?: Position): Enemy {
    return this.clone({
      selectedCard: card,
      selectedCardId: card.id,
      selectedCardInitialPosition: initialPosition || null,
      isAnimating: true,
    });
  }

  // Deselect the current card
  deselectCard(): Enemy {
    return this.clone({
      selectedCard: null,
      selectedCardId: null,
      selectedCardInitialPosition: null,
      isAnimating: false,
    });
  }

  // Set animation state
  setAnimating(isAnimating: boolean): Enemy {
    return this.clone({ isAnimating });
  }

  // Reset enemy state
  reset(): Enemy {
    return this.clone({
      selectedCard: null,
      selectedCardId: null,
      selectedCardInitialPosition: null,
      isAnimating: false,
    });
  }

  // AI: Automatically select a random card
  selectRandomCard(gameRect?: DOMRect, enemyAreaRect?: DOMRect): Enemy {
    const randomCard = this.getRandomCard();
    if (!randomCard) return this;

    const initialPosition = this.getInitialPosition(gameRect, enemyAreaRect);

    return this.selectCard(randomCard, initialPosition);
  }

  getInitialPosition(gameRect?: DOMRect, enemyAreaRect?: DOMRect) {
    let initialPosition: Position | undefined;
    if (gameRect && enemyAreaRect) {
      initialPosition = {
        x: gameRect.width / 2 - (enemyAreaRect.left - gameRect.left) - 62.5,
        y: 50 - (enemyAreaRect.top - gameRect.top),
      };

      return initialPosition;
    }
  }

  // The following methods don't need to return new instances as they don't mutate

  // Get cards that are still in hand (not selected)
  getHandCards(): Card[] {
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
    card: Card;
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

  // Get a random card from hand
  getRandomCard(): Card | null {
    const availableCards = this.getHandCards();
    if (availableCards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
  }

  getCardByMiniMax() {}

  miniMaxAlgorithm() {}
}
