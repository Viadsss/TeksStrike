import type { GameState } from "../types";
import { motion } from "framer-motion";
import { useContext } from "react";
import { SoundContext } from "../context/SoundContext";

interface Props {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Menu({ setGameState }: Props) {
  const { playClick } = useContext(SoundContext);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-7xl h-screen border mx-auto font-gamja border-red-500 flex flex-col items-center justify-center"
    >
      <h1 className="text-6xl">Menu</h1>
      <button
        className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition"
        onClick={() => {
          playClick();
          setGameState((prev) => ({ ...prev, state: "game" }));
        }}
      >
        Start Game
      </button>
      <button
        className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition"
        onClick={() => {
          playClick();
          setGameState((prev) => ({ ...prev, state: "rules" }));
        }}
      >
        Rules
      </button>
      <button
        className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition"
        onClick={() => {
          playClick();
        }}
      >
        Settings
      </button>
    </motion.div>
  );
}
