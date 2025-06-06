import { Player } from "./Player";
import { Enemy } from "./Enemy";

export type SceneState =
  | "loading"
  | "menu"
  | "rules"
  | "game"
  | "collision"
  | "end";

export type EndStatus = "win" | "lose" | "draw" | "pending";

export interface GameState {
  state: SceneState;
  endStatus: EndStatus;
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
