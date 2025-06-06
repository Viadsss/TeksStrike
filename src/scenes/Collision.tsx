import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/Card";
import type { EndStatus, GameState } from "../types";
import { Player } from "../Player";
import { Enemy } from "../Enemy";
import { SoundContext } from "../context/SoundContext";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

type BattlePhase = "setup" | "charging" | "colliding" | "battling" | "resolved";
type BattleResult =
  | "player_wins"
  | "enemy_wins"
  | "draw_both_up"
  | "draw_both_down";

export default function Collision({ gameState, setGameState }: Props) {
  const { player, enemy } = gameState;
  const [battlePhase, setBattlePhase] = useState<BattlePhase>("setup");
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [playerFaceUp, setPlayerFaceUp] = useState<boolean | null>(null);
  const [enemyFaceUp, setEnemyFaceUp] = useState<boolean | null>(null);
  const { playClick, playCardCharge, playCardCollide } =
    useContext(SoundContext);

  // Auto-start battle when both cards are selected
  useEffect(() => {
    const startBattle = async () => {
      playCardCharge();
      setBattlePhase("charging");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      playCardCollide();
      setBattlePhase("colliding");
      setShowEffects(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setBattlePhase("battling");
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Determine face-up status with random chance
      const playerFaceUpResult = Math.random() > 0.5;
      const enemyFaceUpResult = Math.random() > 0.5;

      setPlayerFaceUp(playerFaceUpResult);
      setEnemyFaceUp(enemyFaceUpResult);

      // Determine battle result based on face-up status
      let result: BattleResult;
      let battleWinner: "player" | "enemy" | null = null;

      if (playerFaceUpResult && !enemyFaceUpResult) {
        result = "player_wins";
        battleWinner = "player";
      } else if (!playerFaceUpResult && enemyFaceUpResult) {
        result = "enemy_wins";
        battleWinner = "enemy";
      } else if (playerFaceUpResult && enemyFaceUpResult) {
        // Both face-up = draw
        result = "draw_both_up";
        battleWinner = null;
      } else {
        // Both face-down = draw
        result = "draw_both_down";
        battleWinner = null;
      }

      setBattleResult(result);
      setWinner(battleWinner);
      setBattlePhase("resolved");
      setShowEffects(false);
    };

    if (player.selectedCard && enemy.selectedCard && battlePhase === "setup") {
      startBattle();
    }
  }, [
    player.selectedCard,
    enemy.selectedCard,
    battlePhase,
    playCardCharge,
    playCardCollide,
  ]);

  // If no cards selected, show waiting message
  if (!player.selectedCard || !enemy.selectedCard) {
    return (
      <div className="bg-white p-8">
        <p className="text-gray-600">Waiting for card selection...</p>
        {player.selectedCard && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Player Card:</h3>
            <Card
              card={player.selectedCard}
              flipped={false}
              allowHover={false}
            />
          </div>
        )}
        {enemy.selectedCard && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Enemy Card:</h3>
            <Card
              card={enemy.selectedCard}
              flipped={false}
              allowHover={false}
            />
          </div>
        )}
      </div>
    );
  }

  const handleContinueClick = () => {
    playClick();

    setGameState((prevState) => {
      // Create new instances
      let newPlayer = new Player(prevState.player.cards);
      let newEnemy = new Enemy(prevState.enemy.cards);

      // Copy over the score
      newPlayer.score = prevState.player.score;
      newEnemy.score = prevState.enemy.score;

      if (winner === "player") {
        newPlayer = newPlayer.winRound();
      } else if (winner === "enemy") {
        newEnemy = newEnemy.winRound();
      }

      // Add if we want to keep the cards if draw
      // if (winner !== null) {
      const playerCardID = prevState.player.selectedCardId;
      const enemyCardID = prevState.enemy.selectedCardId;

      if (playerCardID !== null) {
        newPlayer = newPlayer.removeCard(playerCardID);
      }
      if (enemyCardID !== null) {
        newEnemy = newEnemy.removeCard(enemyCardID);
      }
      // }

      if (newPlayer.cards.length === 0 && newEnemy.cards.length === 0) {
        let endStatus: EndStatus;
        if (newPlayer.score > newEnemy.score) endStatus = "win";
        else if (newEnemy.score > newPlayer.score) endStatus = "lose";
        else endStatus = "draw";

        return {
          ...prevState,
          player: newPlayer,
          enemy: newEnemy,
          endStatus: endStatus,
          state: "end",
        };
      } else {
        return {
          ...prevState,
          player: newPlayer,
          enemy: newEnemy,
          state: "game",
        };
      }
    });
  };

  const getCardBattleState = (isPlayer: boolean) => {
    if (battlePhase === "setup") return "idle";
    if (battlePhase === "charging") return "charging";
    if (battlePhase === "colliding") return "colliding";
    if (battlePhase === "battling") return "battling";
    if (battlePhase === "resolved") {
      // Handle draw cases - no winner/loser styling
      if (
        battleResult === "draw_both_up" ||
        battleResult === "draw_both_down"
      ) {
        return "draw";
      }
      // Check if this specific player won (not the card object)
      if (isPlayer && winner === "player") return "winner";
      if (!isPlayer && winner === "enemy") return "winner";
      return "loser";
    }
    return "idle";
  };

  const getAnnouncementText = () => {
    if (battleResult === "draw_both_up") {
      return {
        title: "DRAW!",
        subtitle: "Both cards landed face-up",
        subtext: "No winner this round",
      };
    } else if (battleResult === "draw_both_down") {
      return {
        title: "DRAW!",
        subtitle: "Both cards landed face-down",
        subtext: "No winner this round",
      };
    } else if (winner) {
      const winnerType = winner === "player" ? "Player" : "Enemy";
      const faceUpText =
        winner === "player"
          ? "Player's card landed face-up!"
          : "Enemy's card landed face-up!";
      return {
        title: "VICTORY!",
        subtitle: `${winnerType} wins!`,
        subtext: faceUpText,
      };
    }
    return null;
  };

  const announcement = getAnnouncementText();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden font-gamja">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

      {/* Battle Effects */}
      <AnimatePresence>
        {showEffects && (
          <>
            {/* Main Impact Burst */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-full h-full bg-gradient-radial from-white via-yellow-400 to-red-500 rounded-full" />
            </motion.div>

            {/* Screen Shake Effect */}
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                opacity: [0, 0.3, 0, 0.2, 0],
              }}
              transition={{
                duration: 0.4,
                times: [0, 0.1, 0.2, 0.3, 1],
              }}
            />

            {/* Shockwave Rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute top-1/2 left-1/2 border-4 border-yellow-400 rounded-full"
                style={{
                  width: 50 + i * 20,
                  height: 50 + i * 20,
                  marginLeft: -(25 + i * 10),
                  marginTop: -(25 + i * 10),
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Lightning Bolts */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`lightning-${i}`}
                className="absolute top-1/2 left-1/2 w-2 bg-gradient-to-t from-blue-400 via-white to-yellow-400"
                style={{
                  height: Math.random() * 120 + 80,
                  transform: `rotate(${i * 45}deg)`,
                  transformOrigin: "bottom center",
                }}
                initial={{ scaleY: 0, opacity: 1 }}
                animate={{ scaleY: 1, opacity: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.03,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Sparks */}
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-300 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x:
                    Math.cos((i * 22.5 * Math.PI) / 180) *
                    (100 + Math.random() * 100),
                  y:
                    Math.sin((i * 22.5 * Math.PI) / 180) *
                    (100 + Math.random() * 100),
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Card
          card={enemy.selectedCard}
          battleState={getCardBattleState(false)}
          position="right"
          allowHover={false}
          // Pass face-up status for draw indication
          faceUpInDraw={
            battlePhase === "resolved" &&
            (battleResult === "draw_both_up" ||
              battleResult === "draw_both_down")
              ? enemyFaceUp
              : undefined
          }
        />

        <Card
          card={player.selectedCard}
          battleState={getCardBattleState(true)}
          position="left"
          allowHover={false}
          // Pass face-up status for draw indication
          faceUpInDraw={
            battlePhase === "resolved" &&
            (battleResult === "draw_both_up" ||
              battleResult === "draw_both_down")
              ? playerFaceUp
              : undefined
          }
        />
      </div>

      {/* Winner/Draw Announcement */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2
              className={`text-4xl font-bold mb-2 drop-shadow-lg ${
                battleResult?.startsWith("draw")
                  ? "text-orange-400"
                  : "text-yellow-400"
              }`}
            >
              {announcement.title}
            </h2>
            <p className="text-xl text-white drop-shadow-md mb-1">
              {announcement.subtitle}
            </p>
            <p className="text-sm text-white/80 drop-shadow-md">
              {announcement.subtext}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {announcement && (
          <motion.button
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-bold transition cursor-pointer"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinueClick}
          >
            Continue
          </motion.button>
        )}
      </AnimatePresence>

      {/* Battle Phase Indicator */}
      <div className="absolute top-4 right-4 text-white/70 text-sm font-geist-mono">
        Phase: {battlePhase.toUpperCase()}
        {battleResult && (
          <div className="text-xs mt-1">
            Result: {battleResult.toUpperCase().replace("_", " ")}
          </div>
        )}
        {battlePhase === "resolved" &&
          playerFaceUp !== null &&
          enemyFaceUp !== null && (
            <div className="text-xs mt-1">
              Player: {playerFaceUp ? "Face-Up" : "Face-Down"}
              <br />
              Enemy: {enemyFaceUp ? "Face-Up" : "Face-Down"}
            </div>
          )}
      </div>
    </div>
  );
}
