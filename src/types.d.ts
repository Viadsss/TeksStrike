// types.d.ts
export type SceneState = "loading" | "menu" | "game";

export interface GameState {
  state: SceneState;
}

export interface SceneProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export interface CardData {
  id: number;
  image: string; // Path to the image file
  name: string; // Name of the card
}
