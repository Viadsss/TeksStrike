import { motion } from "framer-motion";
import backImage from "../assets/images/cards/card_back.png";
import type { CardData } from "../types";
import { useContext, useState } from "react";
import { ImageModal } from "./ImageModal";
import { SoundContext } from "../context/SoundContext";

interface Props {
  card: CardData;
  flipped?: boolean;
  allowHover?: boolean;
  allowModal?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  // Optional battle animation props - only used when in battle mode
  battleState?:
    | "idle"
    | "draw"
    | "charging"
    | "colliding"
    | "battling"
    | "winner"
    | "loser";
  position?: "left" | "right";
  // For draw scenarios, indicates if this card was face-up
  faceUpInDraw?: boolean | null;
}

export default function Card({
  card,
  onClick,
  allowHover = true,
  allowModal = true,
  flipped = false,
  battleState,
  position = "left",
  faceUpInDraw,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { playCardSlide } = useContext(SoundContext);

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (allowModal) setIsModalOpen(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle left clicks for the onClick functionality
    if (e.button === 0 && onClick) {
      onClick(e);
      playCardSlide();
    }
  };

  // Only use battle animations if battleState is provided
  const getBattleAnimation = () => {
    if (!battleState || battleState === "idle") {
      return {}; // No battle animation, use default positioning
    }

    switch (battleState) {
      case "charging":
        return {
          x: position === "left" ? 150 : -150,
          scale: 1.1,
          rotateY: position === "left" ? -15 : 15,
          transition: { duration: 0.8, ease: "easeInOut" },
        };
      case "colliding":
        return {
          x: position === "left" ? 62.5 : -62.5,
          scale: 1.3,
          rotateY: 0,
          rotateZ: position === "left" ? 15 : -15,
          transition: { duration: 0.3, ease: "easeOut" },
        };
      case "battling":
        return {
          x: position === "left" ? 62.5 : -62.5,
          scale: [1.3, 1.4, 1.2, 1.4, 1.3],
          rotateY: [0, 180, 360, 180, 0],
          rotateZ: [15, -15, 15, -15, position === "left" ? 15 : -15],
          transition: {
            duration: 2,
            scale: { repeat: 2, duration: 0.5 },
            rotateY: { repeat: 2, duration: 0.5 },
            rotateZ: { repeat: 4, duration: 0.25 },
          },
        };
      case "winner":
        return {
          x: 0,
          y: -0,
          scale: 1.5,
          rotateY: 0,
          rotateZ: 0,
          transition: { duration: 1, ease: "easeOut" },
        };
      case "loser":
        return {
          x: position === "left" ? -200 : 200,
          y: 30,
          scale: 0.7,
          rotateY: 180,
          rotateZ: position === "left" ? -30 : 30,
          transition: { duration: 1, ease: "easeOut" },
        };
      case "draw":
        return {
          x: position === "left" ? -100 : 100,
          y: 0,
          scale: 1,
          rotateY: 0,
          rotateZ: 0,
          opacity: 1,
          transition: { duration: 1, ease: "easeOut" },
        };
      default:
        return {
          x: position === "left" ? -250 : 250,
          y: 0,
          scale: 1,
          rotateY: 0,
          rotateZ: 0,
          opacity: 1,
        };
    }
  };

  const shouldUseBattleAnimation = battleState && battleState !== "idle";

  // Determine if card should show face-up or face-down
  const shouldShowFaceUp = () => {
    if (battleState === "loser") return false; // Losers always show face-down
    if (battleState === "draw" && faceUpInDraw !== undefined) {
      return faceUpInDraw; // In draw, show based on the face-up status
    }
    return !flipped; // Default behavior
  };

  const isCardFaceUp = shouldShowFaceUp();

  return (
    <>
      <motion.div
        className={`
        w-[125px] h-[200px] rounded-md shadow-md overflow-hidden border-2 relative select-none
        ${onClick ? "cursor-pointer" : ""}
        ${!isCardFaceUp ? "bg-gray-200" : "bg-white"}
        ${
          battleState === "winner"
            ? "shadow-2xl shadow-yellow-400/50 ring-4 ring-yellow-400"
            : ""
        }
        ${battleState === "colliding" ? "shadow-2xl shadow-red-500/50" : ""}
        ${
          battleState === "draw"
            ? "shadow-lg shadow-blue-400/30 ring-2 ring-blue-300"
            : ""
        }
      `}
        // Only apply battle animations if battleState is provided and not idle
        animate={shouldUseBattleAnimation ? getBattleAnimation() : undefined}
        whileHover={
          allowHover && (!battleState || battleState === "idle")
            ? {
                y: -80,
                scale: 1.05,
                transition: { duration: 0.15 },
              }
            : {}
        }
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <img
          src={isCardFaceUp ? card.image : backImage}
          alt={card.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Battle Effects - only show during battle */}
        {battleState === "winner" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 pointer-events-none"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}

        {battleState === "colliding" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 pointer-events-none"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.1,
              repeat: 2,
            }}
          />
        )}

        {/* Draw state effect - subtle blue glow */}
        {battleState === "draw" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 pointer-events-none"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}
      </motion.div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={card.image}
        imageAlt={card.name}
      />
    </>
  );
}
