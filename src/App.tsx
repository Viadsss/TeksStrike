import { useState } from "react";
import Loading from "./scenes/Loading";
import Menu from "./scenes/Menu";
import Game from "./scenes/Game";
import Collision from "./scenes/Collision";
import End from "./scenes/End";
import Rules from "./scenes/Rules";
import MusicPlayer from "./components/MusicPlayer";

import type { GameState, SceneProps, SceneState } from "./types";
import { Player } from "./Player";
import { Enemy } from "./Enemy";

const scenes: Record<SceneState, React.ComponentType<SceneProps>> = {
  loading: Loading,
  menu: Menu,
  game: Game,
  collision: Collision,
  end: End,
  rules: Rules,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    isInitialized: false,
    round: 1,
    playerModifiedProbability: 0,
    enemyModifiedProbability: 0,
    state: "loading",
    endStatus: "pending",
    player: new Player([]), // Empty until fetch
    enemy: new Enemy([]),
  });

  const Scene = scenes[gameState.state] || (() => <p>Unknown state</p>);

  return (
    <>
      <MusicPlayer
        currentState={gameState.state}
        endStatus={gameState.endStatus}
      />
      <Scene gameState={gameState} setGameState={setGameState} />
      <details className="absolute top-4 left-4 text-white/80 text-sm font-geist-mono max-h-[75vh] overflow-y-auto">
        <summary>Debug</summary>
        <pre className="bg-white text-gray-800 p-2 rounded font-geist-mono whitespace-pre-wrap">
          {JSON.stringify(gameState, null, 2)}
        </pre>
      </details>
    </>
  );
}
