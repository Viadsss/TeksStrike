import { createContext } from "react";

export const SoundContext = createContext({
  playClick: () => {},
  playCardSlide: () => {},
  playCardCharge: () => {},
  playCardCollide: () => {},
});
