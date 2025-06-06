import { useContext } from "react";
import { cards } from "../cards";
import { Enemy } from "../Enemy";
import { Player } from "../Player";
import type { GameState } from "../types";
import { motion } from "framer-motion";
import { SoundContext } from "../context/SoundContext";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function End({ gameState, setGameState }: Props) {
  const { playClick } = useContext(SoundContext);

  const handlePlayAgain = () => {
    playClick();

    setGameState({
      state: "menu",
      endStatus: "pending",
      player: new Player(cards),
      enemy: new Enemy(cards),
    });
  };

  const declareWinner = () => {
    if (gameState.endStatus === "win") return "Player Wins!";
    else if (gameState.endStatus === "lose") return "Enemy Wins!";
    else if (gameState.endStatus === "draw") return "It's a Draw!";
  };

  const winner = declareWinner();

  const bgColor =
    winner === "Player Wins!"
      ? "bg-gradient-to-b from-black via-green-800 to-black"
      : winner === "Enemy Wins!"
      ? "bg-gradient-to-b from-black via-red-800 to-black"
      : "bg-gradient-to-b from-black via-gray-700 to-black";

  const icon =
    winner === "Player Wins!" ? "🏆" : winner === "Enemy Wins!" ? "💀" : "🤝";

  const subtitle =
    winner === "Player Wins!"
      ? "Victory is yours!"
      : winner === "Enemy Wins!"
      ? "You have been defeated..."
      : "Neither side prevails.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={`w-full h-screen ${bgColor} mx-auto font-gamja flex flex-col items-center justify-center text-center`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-6xl mb-4"
      >
        {icon}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-4xl text-white mb-2"
      >
        ~~~{winner}~~~
      </motion.div>

      <div className="text-white italic text-lg mb-8">{subtitle}</div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlayAgain}
        className="text-xl text-white border-2 rounded px-6 py-3 hover:bg-white hover:text-black transition"
      >
        Play Again
      </motion.button>
    </motion.div>
  );
}
