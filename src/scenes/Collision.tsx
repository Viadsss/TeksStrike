import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/Card";
import type { EndStatus, GameState, SceneState } from "../types";
import { Player } from "../Player";
import { Enemy } from "../Enemy";
import { SoundContext } from "../context/SoundContext";
import { usePost } from "../hooks/usePost";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

type BattlePhase = "setup" | "charging" | "colliding" | "battling" | "resolved";
type BattleResult =
  | "player_wins"
  | "enemy_wins"
  | "draw_both_up"
  | "draw_both_down"
  | "draw_by_repetition";

const MAX_CONSECUTIVE_DRAWS = 5;

export default function Collision({ gameState, setGameState }: Props) {
  const { player, enemy } = gameState;
  const [battlePhase, setBattlePhase] = useState<BattlePhase>("setup");
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [playerFaceUp, setPlayerFaceUp] = useState<boolean | null>(null);
  const [enemyFaceUp, setEnemyFaceUp] = useState<boolean | null>(null);
  const [consecutiveDraws, setConsecutiveDraws] = useState(0);
  const { playClick, playCardCharge, playCardCollide } =
    useContext(SoundContext);
  const [, setIsSync] = useState(false);
  const { post } = usePost();

  function getModifiedProbability(baseProb: number, modifier: number): number {
    return Math.max(0, Math.min(1, baseProb + modifier));
  }

  // Auto-start battle when both cards are selected
  useEffect(() => {
    const startBattle = async (
      playerModifiedProbability: number,
      enemyModifiedProbability: number
    ) => {
      playCardCharge();
      setBattlePhase("charging");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      playCardCollide();
      setBattlePhase("colliding");
      setShowEffects(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setBattlePhase("battling");
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const randomChancePlayer = Math.random();
      const randomChanceEnemy = Math.random();

      // Determine face-up status with random chance
      const playerFaceUpResult = playerModifiedProbability > randomChancePlayer;
      const enemyFaceUpResult = enemyModifiedProbability > randomChanceEnemy;

      console.log("PLAYER MODIFIED PROB", playerModifiedProbability);
      console.log("RANDOM CHANCE PLAYER", randomChancePlayer);

      console.log("ENEMY MODIFIED PROB", enemyModifiedProbability);
      console.log("RANDOM CHANCE ENEMY", randomChanceEnemy);

      setPlayerFaceUp(playerFaceUpResult);
      setEnemyFaceUp(enemyFaceUpResult);

      // Determine battle result based on face-up status
      let result: BattleResult;
      let battleWinner: "player" | "enemy" | null = null;

      if (playerFaceUpResult && !enemyFaceUpResult) {
        result = "player_wins";
        battleWinner = "player";
        setConsecutiveDraws(0); // Reset draw counter on win
      } else if (!playerFaceUpResult && enemyFaceUpResult) {
        result = "enemy_wins";
        battleWinner = "enemy";
        setConsecutiveDraws(0); // Reset draw counter on win
      } else if (playerFaceUpResult && enemyFaceUpResult) {
        // Both face-up = draw
        const newDrawCount = consecutiveDraws + 1;
        if (newDrawCount >= MAX_CONSECUTIVE_DRAWS) {
          result = "draw_by_repetition";
          battleWinner = null;
          setConsecutiveDraws(0); // Reset for next battle
        } else {
          result = "draw_both_up";
          battleWinner = null;
          setConsecutiveDraws(newDrawCount);
        }
      } else {
        // Both face-down = draw
        const newDrawCount = consecutiveDraws + 1;
        if (newDrawCount >= MAX_CONSECUTIVE_DRAWS) {
          result = "draw_by_repetition";
          battleWinner = null;
          setConsecutiveDraws(0); // Reset for next battle
        } else {
          result = "draw_both_down";
          battleWinner = null;
          setConsecutiveDraws(newDrawCount);
        }
      }

      setBattleResult(result);
      setWinner(battleWinner);
      setBattlePhase("resolved");
      setShowEffects(false);
    };

    if (player.selectedCard && enemy.selectedCard && battlePhase === "setup") {
      let playerModifier = 0;
      let enemyModifier = 0;

      // Player's card effects
      if (player.selectedCard?.target === "self") {
        playerModifier += player.selectedCard.modifier;
      } else if (player.selectedCard?.target === "enemy") {
        enemyModifier -= player.selectedCard.modifier;
      }

      // Enemy's card effects
      if (enemy.selectedCard?.target === "self") {
        enemyModifier += enemy.selectedCard.modifier;
      } else if (enemy.selectedCard?.target === "enemy") {
        playerModifier -= enemy.selectedCard.modifier;
      }

      const playerFinalProb = getModifiedProbability(0.5, playerModifier);
      const enemyFinalProb = getModifiedProbability(0.5, enemyModifier);

      startBattle(playerFinalProb, enemyFinalProb);

      setGameState((prevState) => ({
        ...prevState,
        playerModifiedProbability: playerFinalProb,
        enemyModifiedProbability: enemyFinalProb,
        // Ensure state remains the correct SceneState type
        state: prevState.state,
      }));
    }
  }, [
    player.selectedCard,
    enemy.selectedCard,
    battlePhase,
    consecutiveDraws,
    playCardCharge,
    playCardCollide,
    setGameState,
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

  const handleContinueClick = async () => {
    playClick();

    // Check if it's a regular draw (not by repetition) - if so, restart the battle with same cards
    const isRegularDraw =
      battleResult === "draw_both_up" || battleResult === "draw_both_down";

    if (isRegularDraw) {
      // Reset battle state to replay the collision
      setBattlePhase("setup");
      setWinner(null);
      setBattleResult(null);
      setShowEffects(false);
      setPlayerFaceUp(null);
      setEnemyFaceUp(null);
      return; // Don't update game state, just restart the battle
    }

    setIsSync(true);

    try {
      // STEP 1: Calculate what the new state will be (but don't set it yet)
      let newPlayer = new Player(gameState.player.cards);
      let newEnemy = new Enemy(gameState.enemy.cards);

      // Copy over the score
      newPlayer.score = gameState.player.score;
      newEnemy.score = gameState.enemy.score;

      // Handle win/loss (draw by repetition doesn't add to score)
      if (winner === "player") {
        newPlayer = newPlayer.winRound();
      } else if (winner === "enemy") {
        newEnemy = newEnemy.winRound();
      }

      // Store original selected cards for backend sync
      const playerCardUsed = gameState.player.selectedCard;
      const enemyCardUsed = gameState.enemy.selectedCard;

      // Remove cards
      const playerCardID = gameState.player.selectedCardId;
      const enemyCardID = gameState.enemy.selectedCardId;
      if (playerCardID !== null) {
        newPlayer = newPlayer.removeCard(playerCardID);
      }
      if (enemyCardID !== null) {
        newEnemy = newEnemy.removeCard(enemyCardID);
      }

      // Check for game end
      if (newPlayer.cards.length === 0 && newEnemy.cards.length === 0) {
        let endStatus: EndStatus;
        if (newPlayer.score > newEnemy.score) endStatus = "win";
        else if (newEnemy.score > newPlayer.score) endStatus = "lose";
        else endStatus = "draw";

        // STEP 2: Sync backend FIRST with end game
        try {
          await post("http://localhost:3000/end");
          console.log("End game API call successful");
        } catch (error) {
          console.error("End game API call failed:", error);
        }

        // STEP 3: Then update frontend state
        setGameState((prevState) => ({
          ...prevState,
          player: newPlayer,
          enemy: newEnemy,
          endStatus: endStatus,
          state: "end" as SceneState,
        }));
      } else {
        const nextRound = gameState.round + 1;

        // STEP 2: Sync backend FIRST with new game state
        const syncData = {
          round: nextRound,
          playerCards: newPlayer.cards,
          enemyCards: newEnemy.cards,
          playerScore: newPlayer.score,
          enemyScore: newEnemy.score,
          playerCardUsed: playerCardUsed,
          enemyCardUsed: enemyCardUsed,
          winner: winner,
        };

        try {
          const response = await post(
            "http://localhost:3000/sync-state",
            syncData
          );
          console.log("Backend sync successful:", response);
        } catch (error) {
          console.error("Backend sync failed:", error);
        }

        // STEP 3: Then update frontend state (backend is now in sync)
        setGameState((prevState) => ({
          ...prevState,
          round: nextRound,
          player: newPlayer,
          enemy: newEnemy,
          state: "game" as SceneState,
        }));
      }
    } catch (error) {
      console.error("Error during state update:", error);
    } finally {
      setIsSync(false);
    }
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
        battleResult === "draw_both_down" ||
        battleResult === "draw_by_repetition"
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
        subtext: `Battle again with same cards! (${consecutiveDraws}/${MAX_CONSECUTIVE_DRAWS} draws)`,
        buttonText: "Battle Again",
        titleColor: "text-orange-400", // Orange for draw
      };
    } else if (battleResult === "draw_both_down") {
      return {
        title: "DRAW!",
        subtitle: "Both cards landed face-down",
        subtext: `Battle again with same cards! (${consecutiveDraws}/${MAX_CONSECUTIVE_DRAWS} draws)`,
        buttonText: "Battle Again",
        titleColor: "text-orange-400", // Orange for draw
      };
    } else if (battleResult === "draw_by_repetition") {
      return {
        title: "DRAW!",
        subtitle: "Too many consecutive draws",
        subtext: "Battle ends in a stalemate",
        buttonText: "Continue",
        titleColor: "text-purple-400", // Purple for draw by repetition
      };
    } else if (winner) {
      if (winner === "player") {
        return {
          title: "VICTORY!",
          subtitle: "Player wins!",
          subtext: "Player's card landed face-up!",
          buttonText: "Continue",
          titleColor: "text-yellow-400", // Gold for victory
        };
      } else {
        return {
          title: "DEFEAT!",
          subtitle: "Enemy wins!",
          subtext: "Enemy's card landed face-up!",
          buttonText: "Continue",
          titleColor: "text-red-500", // Red for defeat
        };
      }
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
              battleResult === "draw_both_down" ||
              battleResult === "draw_by_repetition")
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
              battleResult === "draw_both_down" ||
              battleResult === "draw_by_repetition")
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
                announcement.titleColor || "text-yellow-400"
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
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-center px-4 py-2 text-white rounded-md font-bold transition cursor-pointer ${
              battleResult === "draw_both_up" ||
              battleResult === "draw_both_down"
                ? "bg-orange-600 hover:bg-orange-700"
                : battleResult === "draw_by_repetition"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinueClick}
          >
            {announcement.buttonText}
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
        {consecutiveDraws > 0 && (
          <div className="text-xs mt-1 text-orange-300">
            Consecutive Draws: {consecutiveDraws}/{MAX_CONSECUTIVE_DRAWS}
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
