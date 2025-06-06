import React from "react";
import useSound from "use-sound";
import clickSound from "../assets/sounds/click.mp3";
import cardSlideSound from "../assets/sounds/card_slide.mp3";
import cardChargeSound from "../assets/sounds/card_charge.mp3";
import cardCollideSound from "../assets/sounds/card_collide.mp3";
import { SoundContext } from "./SoundContext";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [playClick] = useSound(clickSound, { volume: 0.5 });
  const [playCardSlide] = useSound(cardSlideSound, { volume: 0.5 });
  const [playCardCharge] = useSound(cardChargeSound, { volume: 0.3 });
  const [playCardCollide] = useSound(cardCollideSound, { volume: 0.5 });

  return (
    <SoundContext.Provider
      value={{ playClick, playCardSlide, playCardCollide, playCardCharge }}
    >
      {children}
    </SoundContext.Provider>
  );
}
