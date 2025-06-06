import Loading from "./scenes/Loading";
import Menu from "./scenes/Menu";
import Game from "./scenes/Game";
import { useState } from "react";
import type { GameState, SceneProps, SceneState } from "./types";

const scenes: Record<SceneState, React.ComponentType<SceneProps>> = {
  loading: Loading,
  menu: Menu,
  game: Game,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({ state: "game" });

  const Scene = scenes[gameState.state] || (() => <p>Unknown state</p>);

  return <Scene setGameState={setGameState} />;
}
