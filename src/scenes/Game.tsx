import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hand from "../components/Hand";
import Card from "../components/Card";
import { cards } from "../cards";
import type { CardData, GameState } from "../types";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Game({ gameState, setGameState }: Props) {
  const [visibleCards, setVisibleCards] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const { player, enemy } = gameState;

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev >= cards.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Update player and enemy cards based on visible cards
  useEffect(() => {
    const currentPlayerCards = cards.slice(0, visibleCards);
    const currentEnemyCards = cards.slice(0, visibleCards);

    // Update the game state with new cards
    setGameState((prevState) => ({
      ...prevState,
      player: Object.assign(
        Object.create(Object.getPrototypeOf(prevState.player)),
        {
          ...prevState.player,
          cards: currentPlayerCards,
        }
      ),
      enemy: Object.assign(
        Object.create(Object.getPrototypeOf(prevState.enemy)),
        {
          ...prevState.enemy,
          cards: currentEnemyCards,
        }
      ),
    }));
  }, [visibleCards, setGameState]);

  const handleCardClick = (
    card: CardData,
    id: number,
    element: HTMLElement
  ) => {
    // If clicking the same card that's already selected, deselect it
    console.log(id);
    if (player.isCardSelected(card.id)) {
      setGameState((prevState) => {
        prevState.player.deselectCard();
        return { ...prevState };
      });
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready before calculating positions
    requestAnimationFrame(() => {
      // Get the card's current position and target position
      const cardRect = element.getBoundingClientRect();
      const gameRect = gameAreaRef.current?.getBoundingClientRect();
      const playerAreaElement = document.getElementById("player-card-area");
      const playerAreaRect = playerAreaElement?.getBoundingClientRect();

      if (
        gameRect &&
        playerAreaRect &&
        cardRect.width > 0 &&
        cardRect.height > 0
      ) {
        // Calculate relative positions
        const initialPosition = {
          x: cardRect.left - playerAreaRect.left,
          y: cardRect.top - playerAreaRect.top,
        };

        setGameState((prevState) => {
          prevState.player.selectCard(card, initialPosition);
          return { ...prevState };
        });
      } else {
        // Fallback: if position calculation fails, still select the card
        setGameState((prevState) => {
          prevState.player.selectCard(card);
          return { ...prevState };
        });
      }
    });
  };

  const handleSelectedCardClick = () => {
    // Return the selected card to hand
    setGameState((prevState) => {
      prevState.player.deselectCard();
      return { ...prevState };
    });
  };

  const handleEnemyCardSelection = () => {
    if (enemy.cards.length === 0) return;

    // Don't allow selection if already animating
    if (player.isAnimating || enemy.isAnimating) return;

    // Calculate the initial position (from enemy hand to enemy card area)
    const enemyAreaElement = document.getElementById("enemy-card-area");
    const enemyAreaRect = enemyAreaElement?.getBoundingClientRect();
    const gameRect = gameAreaRef.current?.getBoundingClientRect();

    setGameState((prevState) => {
      prevState.enemy.selectRandomCard(
        gameRect || undefined,
        enemyAreaRect || undefined
      );
      return { ...prevState };
    });
  };

  const handleResetBattle = () => {
    setGameState((prevState) => {
      prevState.player.reset();
      prevState.enemy.reset();
      return { ...prevState };
    });
  };

  const handleAnimationComplete = () => {
    setGameState((prevState) => {
      prevState.player.setAnimating(false);
      prevState.enemy.setAnimating(false);
      return { ...prevState };
    });
  };

  const selectedCard = player.getSelectedCardData();
  const enemySelectedCard = enemy.getSelectedCardData();
  const isAnimating = player.isAnimating || enemy.isAnimating;

  return (
    <div className="w-7xl h-screen border-2 mx-auto font-gamja border-red-500">
      <div
        ref={gameAreaRef}
        className="bg-transparent w-full h-full border-2 flex flex-col items-center justify-between gap-4 pb-8 overflow-hidden relative"
      >
        <Hand
          hand={enemy.getHandCards()}
          flippedCards={true}
          reverse={true}
          interactive={false}
        />

        {/* Middle battle area */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-center justify-center gap-8">
            {/* Player card area */}
            <div className="relative w-[125px] h-[200px]" id="player-card-area">
              <AnimatePresence>
                {selectedCard && (
                  <motion.div
                    initial={
                      selectedCard.initialPosition
                        ? {
                            x: selectedCard.initialPosition.x,
                            y: selectedCard.initialPosition.y,
                            scale: 0.8,
                          }
                        : {
                            scale: 0,
                            opacity: 0,
                          }
                    }
                    animate={{
                      x: 0,
                      y: 0,
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.4,
                    }}
                    onAnimationComplete={handleAnimationComplete}
                    className="absolute"
                  >
                    <Card
                      card={selectedCard.card}
                      onClick={handleSelectedCardClick}
                      flipped={false}
                      allowHover={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {!selectedCard && (
                <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-bold">
                    Player Card
                  </span>
                </div>
              )}
            </div>

            {/* VS text */}
            <div className="text-4xl font-bold text-red-600">VS</div>

            {/* Enemy card area */}
            <div className="relative w-[125px] h-[200px]" id="enemy-card-area">
              <AnimatePresence>
                {enemySelectedCard && (
                  <motion.div
                    initial={
                      enemySelectedCard.initialPosition
                        ? {
                            x: enemySelectedCard.initialPosition.x,
                            y: enemySelectedCard.initialPosition.y,
                            scale: 0.8,
                          }
                        : {
                            scale: 0,
                            opacity: 0,
                          }
                    }
                    animate={{
                      x: 0,
                      y: 0,
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.4,
                    }}
                    onAnimationComplete={handleAnimationComplete}
                    className="absolute"
                  >
                    <Card
                      card={enemySelectedCard.card}
                      flipped={false}
                      allowHover={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {!enemySelectedCard && (
                <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-bold">
                    Enemy Card
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleEnemyCardSelection}
            disabled={isAnimating || enemy.cards.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
          >
            Enemy Select Card
          </button>
          <button
            onClick={handleResetBattle}
            disabled={isAnimating}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
          >
            Reset Battle
          </button>
          <button
            disabled={!selectedCard || !enemySelectedCard}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
            onClick={() =>
              setGameState((prev) => ({ ...prev, state: "collision" }))
            }
          >
            Battle
          </button>
        </div>

        <Hand
          hand={player.getHandCards()}
          flippedCards={false}
          reverse={false}
          interactive={
            visibleCards >= cards.length && !isAnimating && !selectedCard
          }
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}
