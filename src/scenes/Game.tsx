import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hand from "../components/Hand";
import Card from "../components/Card";
import { cards } from "../cards";
import type { GameState } from "../types";
import { Card as CardModel } from "../Card";
import { SoundContext } from "../context/SoundContext";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Game({ gameState, setGameState }: Props) {
  const [visibleCards, setVisibleCards] = useState(0);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [enemyHasSelectedCard, setEnemyHasSelectedCard] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { playClick, playCardSlide } = useContext(SoundContext);

  const { player, enemy } = gameState;

  // Initial card distribution animation
  useEffect(() => {
    // Only run if game is not initialized and players have no cards
    if (
      !gameInitialized &&
      player.cards.length === 0 &&
      enemy.cards.length === 0
    ) {
      const timer = setInterval(() => {
        setVisibleCards((prev) => {
          if (prev >= cards.length) {
            clearInterval(timer);
            setGameInitialized(true);
            return prev;
          }
          return prev + 1;
        });
      }, 200);

      return () => clearInterval(timer);
    }
  }, [gameInitialized, player.cards.length, enemy.cards.length]);

  // Update player and enemy cards based on visible cards (only during initial setup)
  useEffect(() => {
    if (!gameInitialized && visibleCards > 0) {
      const currentPlayerCards = cards.slice(0, visibleCards);
      const currentEnemyCards = cards.slice(0, visibleCards);

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
    }
  }, [visibleCards, setGameState, gameInitialized]);

  // Reset initialization when coming back from other states
  useEffect(() => {
    if (
      gameState.state === "game" &&
      (player.cards.length > 0 || enemy.cards.length > 0)
    ) {
      setGameInitialized(true);
      setVisibleCards(cards.length);
    }
  }, [gameState.state, player.cards.length, enemy.cards.length]);

  const handleCardClick = (
    card: CardModel,
    id: number,
    element: HTMLElement
  ) => {
    // If clicking the same card that's already selected, deselect it
    console.log(id);
    if (player.isCardSelected(card.id)) {
      setGameState((prevState) => ({
        ...prevState,
        player: prevState.player.deselectCard(),
      }));
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

        setGameState((prevState) => ({
          ...prevState,
          player: prevState.player.selectCard(card, initialPosition),
        }));
      } else {
        // Fallback: if position calculation fails, still select the card
        setGameState((prevState) => ({
          ...prevState,
          player: prevState.player.selectCard(card),
        }));
      }
    });
  };

  const handleSelectedCardClick = () => {
    // Return the selected card to hand
    setGameState((prevState) => ({
      ...prevState,
      player: prevState.player.deselectCard(),
    }));
  };

  const handleEnemyCardSelection = useCallback(() => {
    if (enemy.cards.length === 0) return;

    // Don't allow selection if already animating
    if (player.isAnimating || enemy.isAnimating) return;

    // Calculate the initial position (from enemy hand to enemy card area)
    const enemyAreaElement = document.getElementById("enemy-card-area");
    const enemyAreaRect = enemyAreaElement?.getBoundingClientRect();
    const gameRect = gameAreaRef.current?.getBoundingClientRect();

    setGameState((prevState) => ({
      ...prevState,
      enemy: prevState.enemy.selectRandomCard(
        gameRect || undefined,
        enemyAreaRect || undefined
      ),
    }));
  }, [enemy.cards.length, enemy.isAnimating, player.isAnimating, setGameState]);

  const handleResetBattle = () => {
    playClick();
    setEnemyHasSelectedCard(false);

    setGameState((prevState) => ({
      ...prevState,
      player: prevState.player.reset(),
      enemy: prevState.enemy.reset(),
    }));
  };

  const handleAnimationComplete = () => {
    setGameState((prevState) => ({
      ...prevState,
      player: prevState.player.setAnimating(false),
      enemy: prevState.enemy.setAnimating(false),
    }));
  };

  const selectedCard = player.getSelectedCardData();
  const enemySelectedCard = enemy.getSelectedCardData();
  const isAnimating = player.isAnimating || enemy.isAnimating;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (
      gameInitialized &&
      !enemyHasSelectedCard &&
      enemy.cards.length > 0 &&
      !player.isAnimating &&
      !enemy.isAnimating &&
      !enemy.getSelectedCardData()
    ) {
      const delay = Math.random() * 1000 + 2000;

      timer = setTimeout(() => {
        handleEnemyCardSelection();
        playCardSlide();
        setEnemyHasSelectedCard(true);
      }, delay);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    enemy,
    enemyHasSelectedCard,
    gameInitialized,
    player.isAnimating,
    handleEnemyCardSelection,
    playCardSlide,
  ]);

  function winnerStatus(): "player" | "enemy" | "draw" {
    if (player.score > enemy.score) return "player";
    if (enemy.score > player.score) return "enemy";
    return "draw";
  }

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
                      allowModal={true}
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
                      flipped={true}
                      allowHover={false}
                      allowModal={false}
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

        <div className="flex gap-x-4 justify-around text-2xl -mt-20 text-shadow-red-300 w-full text-white">
          <div
            className={`bg-sky-950 rounded py-1 px-2 ${
              winnerStatus() === "player" ? "border-b-4 border-yellow-400" : ""
            }`}
          >
            Player Score :<span className="font-bold"> {player.score}</span>
          </div>
          <div
            className={`bg-sky-950 rounded py-1 px-2 ${
              winnerStatus() === "enemy" ? "border-b-4 border-yellow-400" : ""
            }`}
          >
            Enemy Score : <span className="font-bold"> {enemy.score}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleResetBattle}
            disabled={isAnimating}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
          >
            Reset Battle
          </button>
          <button
            disabled={!selectedCard || !enemySelectedCard}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
            onClick={() => {
              playClick();
              setGameState((prev) => ({ ...prev, state: "collision" }));
            }}
          >
            Battle
          </button>
        </div>

        <Hand
          hand={player.getHandCards()}
          flippedCards={false}
          reverse={false}
          interactive={gameInitialized && !isAnimating && !selectedCard}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}
