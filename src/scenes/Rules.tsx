import { motion, AnimatePresence } from "framer-motion";
import { useState, useContext } from "react";
import { SoundContext } from "../context/SoundContext";
import type { GameState } from "../types";

interface Props {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const pages = [
  {
    title: "Game Overview",
    content: (
      <ul className="list-disc pl-5 space-y-2 text-left max-w-xl">
        <li>Each player gets a set of 10 teks cards.</li>
        <li>Each card modifies the chance of landing face-up (base: 50%).</li>
        <li>Each round, players choose 1 card to play simultaneously.</li>
        <li>AI uses heuristics and alpha-beta pruning to choose its card.</li>
      </ul>
    ),
  },
  {
    title: "Collision Phase",
    content: (
      <ul className="list-disc pl-5 space-y-2 text-left max-w-xl">
        <li>Cards are revealed and modifiers are applied.</li>
        <li>Self-target cards increase your chance.</li>
        <li>Enemy-target cards reduce your opponent’s chance.</li>
        <li>Final outcome is determined via random roll with modifiers.</li>
      </ul>
    ),
  },
  {
    title: "Scoring & Draw Rule",
    content: (
      <ul className="list-disc pl-5 space-y-2 text-left max-w-xl">
        <li>Face-up card earns 1 point.</li>
        <li>If both cards match state (up/down), it's a draw, round resets.</li>
        <li>Same cards drawing 5 times? Both discarded, no points.</li>
        <li>Game ends when all cards are used. Highest score wins!</li>
      </ul>
    ),
  },
  {
    title: "Teks Card Attributes",
    content: (
      <ul className="list-disc pl-5 space-y-2 text-left max-w-xl">
        <li>
          <b>Name</b> – Based on Filipino heroes.
        </li>
        <li>
          <b>Modifier</b> – How much it changes face-up chance.
        </li>
        <li>
          <b>Target</b> – Affects you or your opponent.
        </li>
        <li>
          <b>Rarity</b> – Common, Rare, or Legendary.
        </li>
      </ul>
    ),
  },
];

export default function Rules({ setGameState }: Props) {
  const { playClick } = useContext(SoundContext);
  const [pageIndex, setPageIndex] = useState(0);

  const nextPage = () => {
    playClick();
    if (pageIndex < pages.length - 1) setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    playClick();
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const goBackToMenu = () => {
    playClick();
    setGameState((prev) => ({ ...prev, state: "menu" }));
  };

  return (
    <div className="w-full h-screen mx-auto font-gamja flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={pageIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="text-center backdrop-blur-md bg-white/10 border border-black/20 rounded-xl shadow-lg p-6 max-w-2xl"
        >
          <h1 className="text-4xl mb-4">{pages[pageIndex].title}</h1>
          <div className="text-xl">{pages[pageIndex].content}</div>
        </motion.div>
      </AnimatePresence>

      <div className="flex mt-10 gap-4">
        <button
          className="border rounded px-4 py-2 hover:bg-gray-200 transition"
          onClick={prevPage}
          disabled={pageIndex === 0}
        >
          Previous
        </button>
        <button
          className="border rounded px-4 py-2 hover:bg-gray-200 transition"
          onClick={nextPage}
          disabled={pageIndex === pages.length - 1}
        >
          Next
        </button>
      </div>

      <button
        className="absolute bottom-10 border rounded px-4 py-2 hover:bg-gray-200 transition"
        onClick={goBackToMenu}
      >
        Back to Menu
      </button>
    </div>
  );
}
