import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { GameState } from "../types";

interface Props {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Loading({ setGameState }: Props) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true); // trigger fade out
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, state: "game" }));
        // actually hide after fade
      }, 500); // match with exit animation duration
    }, 3000);

    return () => clearTimeout(timer);
  }, [setGameState]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="h-screen w-screen flex flex-col justify-center items-center bg-black text-white font-gamja absolute top-0 left-0"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-96 h-8 bg-gray-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-green-400"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "50%", "85%", "100%"] }}
              transition={{
                duration: 3,
                times: [0, 0.3, 0.8, 1],
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-4xl flex gap-1 items-end">
            Loading
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.2,
                }}
              >
                .
              </motion.span>
            ))}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
