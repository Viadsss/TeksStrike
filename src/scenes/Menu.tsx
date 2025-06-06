import useSound from "use-sound";
import menuMusic from "../assets/sounds/audio_test.mp3"; // path relative to `public/`
import { useEffect } from "react";
import type { GameState } from "../types";

interface Props {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Menu({ setGameState }: Props) {
  const [play, { stop, sound }] = useSound(menuMusic, {
    volume: 0.2,
    loop: true,
  });

  // Auto play on mount
  useEffect(() => {
    play();

    const fadeTimer = setTimeout(() => {
      if (sound) {
        sound.fade(0, 0.2, 1000);
      }
    }, 100); // Delay slightly to avoid "sound is null"

    return () => {
      clearTimeout(fadeTimer);
      stop();
    };
  }, [play, stop, sound]);

  return (
    <div className="w-7xl h-screen border mx-auto font-gamja border-red-500 flex flex-col items-center justify-center">
      <h1 className="text-6xl">Menu</h1>
      <button
        className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition"
        onClick={() => {
          stop();
          setGameState((prev) => ({ ...prev, state: "game" }));
        }}
      >
        Start Game
      </button>
      <button className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition">
        Rules
      </button>
      <button className="text-xl border rounded px-4 py-2 mt-8 hover:bg-gray-200 transition">
        Settings
      </button>
    </div>
  );
}
