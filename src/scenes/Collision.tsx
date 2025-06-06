import Card from "../components/Card";
import type { GameState } from "../types";

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function Collision({ gameState }: Props) {
  const { player, enemy } = gameState;

  console.log(gameState);

  return (
    <div className="bg-white">
      {player.selectedCard && (
        <Card card={player.selectedCard} flipped={false} allowHover={false} />
      )}

      {enemy.selectedCard && (
        <Card card={enemy.selectedCard} flipped={false} allowHover={false} />
      )}
    </div>
  );
}
