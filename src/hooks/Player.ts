import { useCallback, useState } from "react";
import type { CardData, Position, SelectedCard } from "../types";

export default function usePlayer(initialCards: CardData[] = []) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);

  // Get cards currently in hand (excluding selected card)
  const handCards = selectedCard
    ? cards.filter((card) => card.id !== selectedCard.id)
    : cards;

  // Select a card with position tracking
  const selectCard = useCallback(
    (card: CardData, initialPosition?: Position) => {
      setSelectedCard({
        card,
        id: card.id,
        initialPosition,
      });
    },
    []
  );

  // Deselect current card
  const deselectCard = useCallback(() => {
    setSelectedCard(null);
  }, []);

  // Toggle card selection
  const toggleCard = useCallback(
    (card: CardData, initialPosition?: Position) => {
      if (selectedCard?.id === card.id) {
        deselectCard();
      } else {
        selectCard(card, initialPosition);
      }
    },
    [selectedCard, selectCard, deselectCard]
  );

  // Check if a specific card is selected
  const isCardSelected = useCallback(
    (cardId: number) => {
      return selectedCard?.id === cardId;
    },
    [selectedCard]
  );

  // Check if player has any card selected
  const hasSelectedCard = selectedCard !== null;

  // Add cards to player's deck
  const addCards = useCallback((newCards: CardData[]) => {
    setCards((prev) => [...prev, ...newCards]);
  }, []);

  // Remove a card from player's deck
  const removeCard = useCallback((cardId: number) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  }, []);

  // Reset player state
  const reset = useCallback(() => {
    setSelectedCard(null);
  }, []);

  return {
    // State
    cards,
    selectedCard,
    handCards,
    hasSelectedCard,

    // Actions
    selectCard,
    deselectCard,
    toggleCard,
    isCardSelected,
    addCards,
    removeCard,
    reset,

    // Internal setters (for advanced use)
    setCards,
    setSelectedCard,
  };
}
