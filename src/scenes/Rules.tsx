import { motion } from "framer-motion";
import type { GameState } from "../types";
import { useContext } from "react";
import { SoundContext } from "../context/SoundContext";

interface Props {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Rules({ setGameState }: Props) {
  const { playClick } = useContext(SoundContext);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="w-7xl h-screen border mx-auto font-gamja border-red-500 flex flex-col items-center justify-center"
    >
      <h1 className="text-4xl">Rules</h1>
      <button
        className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition"
        onClick={() => {
          playClick();
          setGameState((prev) => ({ ...prev, state: "menu" }));
        }}
      >
        Back
      </button>
    </motion.div>
  );
}
