// types.d.ts
export type SceneState = "loading" | "menu" | "game" | "collision";

export interface GameState {
  state: SceneState;
  playerCards: CardData[];
  playerSelectedCardID: number | null;

  enemyCards: CardData[];
  enemySelectedCardID: number | null;
}

export interface SceneProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export interface CardData {
  id: number;
  image: string; // Path to the image file
  name: string; // Name of the card
}

export interface EnemySelectedCard {
  card: CardData;
  id: number;
  initialPosition?: { x: number; y: number };
}

export interface SelectedCard {
  card: CardData;
  id: number;
  initialPosition?: { x: number; y: number };
}

export interface Position {
  x: number;
  y: number;
}
