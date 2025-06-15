import { Card } from "./Card";
import type { Position } from "./types";

export class Player {
  public cards: Card[] = [];
  public selectedCard: Card | null = null;
  public selectedCardId: number | null = null;
  public selectedCardInitialPosition: Position | null = null;
  public isAnimating: boolean = false;
  public score: number = 0;

  constructor(cards: Card[] = []) {
    this.cards = [...cards];
  }

  private clone(updates: Partial<Player> = {}): Player {
    const newPlayer = new Player();
    newPlayer.cards = [...this.cards];
    newPlayer.selectedCard = this.selectedCard;
    newPlayer.selectedCardId = this.selectedCardId;
    newPlayer.selectedCardInitialPosition = this.selectedCardInitialPosition;
    newPlayer.isAnimating = this.isAnimating;
    newPlayer.score = this.score;

    Object.assign(newPlayer, updates);
    return newPlayer;
  }

  winRound(): Player {
    return this.clone({ score: this.score + 1 });
  }

  addCard(card: Card): Player {
    return this.clone({ cards: [...this.cards, card] });
  }

  removeCard(cardId: number): Player {
    return this.clone({
      cards: this.cards.filter((card) => card.id !== cardId),
    });
  }

  selectCard(card: Card, initialPosition?: Position): Player {
    return this.clone({
      selectedCard: card,
      selectedCardId: card.id,
      selectedCardInitialPosition: initialPosition || null,
      isAnimating: true,
    });
  }

  deselectCard(): Player {
    return this.clone({
      selectedCard: null,
      selectedCardId: null,
      selectedCardInitialPosition: null,
      isAnimating: false,
    });
  }

  setAnimating(isAnimating: boolean): Player {
    return this.clone({ isAnimating });
  }

  reset(): Player {
    return this.clone({
      selectedCard: null,
      selectedCardId: null,
      selectedCardInitialPosition: null,
      isAnimating: false,
    });
  }

  getHandCards(): Card[] {
    if (this.selectedCardId === null) {
      return this.cards;
    }
    return this.cards.filter((card) => card.id !== this.selectedCardId);
  }

  isCardSelected(cardId: number): boolean {
    return this.selectedCardId === cardId;
  }

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
}
