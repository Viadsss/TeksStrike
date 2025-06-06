import { Player } from "./Player";
import { Enemy } from "./Enemy";

export type SceneState = "loading" | "menu" | "game" | "collision";

export interface GameState {
  state: SceneState;
  player: Player;
  enemy: Enemy;
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

export interface Position {
  x: number;
  y: number;
}

// These interfaces are now less needed since we have classes,
// but keeping them for backward compatibility if needed
export interface EnemySelectedCard {
  card: CardData;
  id: number;
  initialPosition?: Position;
}

export interface SelectedCard {
  card: CardData;
  id: number;
  initialPosition?: Position;
}
