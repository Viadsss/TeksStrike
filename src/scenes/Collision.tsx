import type { GameState } from "../types";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Collision({ gameState }: Props) {
  return (
    <div className="bg-white">
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
    </div>
  );
}
