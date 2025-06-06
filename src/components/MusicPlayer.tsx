/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import useSound from "use-sound";
import menuMusic from "../assets/sounds/menu.mp3";
import gameMusic from "../assets/sounds/game.mp3";
import winMusic from "../assets/sounds/win.wav";
import loseMusic from "../assets/sounds/lose.mp3";
import drawMusic from "../assets/sounds/draw.mp3";
import type { EndStatus, SceneState } from "../types";

interface Props {
  currentState: SceneState;
  endStatus: EndStatus;
}

export default function MusicPlayer({ currentState, endStatus }: Props) {
  const [playMenu, { stop: stopMenu, sound: soundMenu }] = useSound(menuMusic, {
    volume: 0, // Start at 0 so we can fade in properly
    loop: true,
    soundEnabled: true,
  });

  const [playGame, { stop: stopGame, sound: soundGame }] = useSound(gameMusic, {
    volume: 0,
    loop: true,
    soundEnabled: true,
  });

  const [playWin, { stop: stopWin, sound: soundWin }] = useSound(winMusic, {
    volume: 0,
    loop: false,
    soundEnabled: true,
  });

  const [playLose, { stop: stopLose, sound: soundLose }] = useSound(loseMusic, {
    volume: 0,
    loop: false,
    soundEnabled: true,
  });

  const [playDraw, { stop: stopDraw, sound: soundDraw }] = useSound(drawMusic, {
    volume: 0,
    loop: false,
    soundEnabled: true,
  });

  // Keeps track of the currently playing music category
  const currentTrackRef = useRef<
    "menu" | "game" | "win" | "lose" | "draw" | null
  >(null);

  // Define target volumes for each track
  const getTargetVolume = (trackType: string) => {
    switch (trackType) {
      case "menu":
        return 0.5;
      case "game":
        return 0.3;
      case "win":
        return 0.5;
      case "lose":
        return 0.5;
      case "draw":
        return 0.5;
      default:
        return 0.5;
    }
  };

  useEffect(() => {
    // Determine which track corresponds to currentState and endStatus
    let desiredTrack: "menu" | "game" | "win" | "lose" | "draw" | null = null;

    if (
      currentState === "menu" ||
      currentState === "rules"
      // currentState === "loading"
    ) {
      desiredTrack = "menu";
    } else if (currentState === "game" || currentState === "collision") {
      desiredTrack = "game";
    } else if (currentState === "end") {
      // Choose track based on endStatus
      if (endStatus === "win") {
        desiredTrack = "win";
      } else if (endStatus === "lose") {
        desiredTrack = "lose";
      } else if (endStatus === "draw") {
        desiredTrack = "draw";
      } else if (endStatus === "pending") {
        desiredTrack = null;
      }
    }

    // If already playing the right track, do nothing
    if (currentTrackRef.current === desiredTrack) return;

    // Fade out and stop all tracks except desired
    const fadeOutAndStop = (sound: any | undefined, stop: () => void) => {
      if (sound?.playing()) {
        const currentVolume = sound.volume();
        if (currentVolume > 0) {
          sound.fade(currentVolume, 0, 800);
          setTimeout(() => stop(), 800);
        } else {
          stop(); // If already at 0 volume, just stop immediately
        }
      }
    };

    // Stop all tracks that aren't the desired one
    if (desiredTrack !== "menu") fadeOutAndStop(soundMenu, stopMenu);
    if (desiredTrack !== "game") fadeOutAndStop(soundGame, stopGame);
    if (desiredTrack !== "win") fadeOutAndStop(soundWin, stopWin);
    if (desiredTrack !== "lose") fadeOutAndStop(soundLose, stopLose);
    if (desiredTrack !== "draw") fadeOutAndStop(soundDraw, stopDraw);

    // Play desired track if not playing
    const playAndFadeIn = (
      play: () => void,
      sound: any | undefined,
      trackType: string
    ) => {
      if (!sound) {
        console.log("No Sound");
        return;
      }

      if (sound && !sound.playing()) {
        const targetVolume = getTargetVolume(trackType);

        // Ensure volume is at 0 before playing
        sound.volume(0);
        play();

        // Wait a bit for the sound to start, then fade in
        setTimeout(() => {
          if (sound.playing()) {
            sound.fade(0, targetVolume, 1000);
          }
        }, 50);
      }
    };

    // Play the appropriate track
    if (desiredTrack === "menu") playAndFadeIn(playMenu, soundMenu, "menu");
    if (desiredTrack === "game") playAndFadeIn(playGame, soundGame, "game");
    if (desiredTrack === "win") playAndFadeIn(playWin, soundWin, "win");
    if (desiredTrack === "lose") playAndFadeIn(playLose, soundLose, "lose");
    if (desiredTrack === "draw") playAndFadeIn(playDraw, soundDraw, "draw");

    currentTrackRef.current = desiredTrack;
  }, [
    currentState,
    endStatus,
    playMenu,
    stopMenu,
    soundMenu,
    playGame,
    stopGame,
    soundGame,
    playWin,
    stopWin,
    soundWin,
    playLose,
    stopLose,
    soundLose,
    playDraw,
    stopDraw,
    soundDraw,
  ]);

  return null;
}
