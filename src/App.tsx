import Loading from "./scenes/Loading";
import Menu from "./scenes/Menu";
import Game from "./scenes/Game";
import { useState } from "react";
import type { GameState, SceneProps, SceneState } from "./types";
import Collision from "./scenes/Collision";

const scenes: Record<SceneState, React.ComponentType<SceneProps>> = {
  loading: Loading,
  menu: Menu,
  game: Game,
  collision: Collision,
};

const initialGameState: GameState = {
  state: "game",

  playerCards: [],
  playerSelectedCardID: null,

  enemyCards: [],
  enemySelectedCardID: null,
};

export default function App() {
  const [gameState, setGameState] = useState(initialGameState);

  const Scene = scenes[gameState.state] || (() => <p>Unknown state</p>);

  return <Scene gameState={gameState} setGameState={setGameState} />;
}
