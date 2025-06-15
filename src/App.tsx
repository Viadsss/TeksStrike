import Loading from "./scenes/Loading";
import Menu from "./scenes/Menu";
import Game from "./scenes/Game";
import { useState } from "react";
import type { GameState, SceneProps, SceneState } from "./types";
import Collision from "./scenes/Collision";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { cards } from "./cards";
import End from "./scenes/End";
import Rules from "./scenes/Rules";
import MusicPlayer from "./components/MusicPlayer";

const scenes: Record<SceneState, React.ComponentType<SceneProps>> = {
  loading: Loading,
  menu: Menu,
  game: Game,
  collision: Collision,
  end: End,
  rules: Rules,
};

const initialGameState: GameState = {
  playerModifiedProbability: 0,
  enemyModifiedProbability: 0,
  state: "loading",
  endStatus: "pending",
  player: new Player(cards), // Initialize with cards
  enemy: new Enemy(cards), // Initialize with cards
};

export default function App() {
  const [gameState, setGameState] = useState(initialGameState);

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
