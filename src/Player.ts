import type { CardData, Position } from "./types";

export class Player {
  public cards: CardData[] = [];
  public selectedCard: CardData | null = null;
  public selectedCardId: number | null = null;
  public selectedCardInitialPosition: Position | null = null;
  public isAnimating: boolean = false;
  public score: number = 0;

  constructor(cards: CardData[] = []) {
    this.cards = [...cards];
  }

  // Create a new instance with updated properties
  private clone(updates: Partial<Player> = {}): Player {
    const newPlayer = new Player();
    newPlayer.cards = [...this.cards];
    newPlayer.selectedCard = this.selectedCard;
    newPlayer.selectedCardId = this.selectedCardId;
    newPlayer.selectedCardInitialPosition = this.selectedCardInitialPosition;
    newPlayer.isAnimating = this.isAnimating;
    newPlayer.score = this.score;

    // Apply updates
    Object.assign(newPlayer, updates);
    return newPlayer;
  }

  winRound(): Player {
    return this.clone({ score: this.score + 1 });
  }

  // Add a card to the player's hand
  addCard(card: CardData): Player {
    return this.clone({ cards: [...this.cards, card] });
  }

  // Remove a card from the player's hand by ID
  removeCard(cardId: number): Player {
    return this.clone({
      cards: this.cards.filter((card) => card.id !== cardId),
    });
  }

  // Select a card for battle
  selectCard(card: CardData, initialPosition?: Position): Player {
    return this.clone({
      selectedCard: card,
      selectedCardId: card.id,
      selectedCardInitialPosition: initialPosition || null,
      isAnimating: true,
    });
  }

  // Deselect the current card
  deselectCard(): Player {
    return this.clone({
      selectedCard: null,
      selectedCardId: null,
      selectedCardInitialPosition: null,
      isAnimating: false,
    });
  }

  // Set animation state
  setAnimating(isAnimating: boolean): Player {
    return this.clone({ isAnimating });
  }

  // Reset player state
  reset(): Player {
    return this.clone({
      selectedCard: null,
      selectedCardId: null,
      selectedCardInitialPosition: null,
      isAnimating: false,
    });
  }

  // The following methods don't need to return new instances as they don't mutate

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
}
