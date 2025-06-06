import { motion } from "framer-motion";
import backImage from "../assets/images/cards/card_back.png";
import { useState } from "react";
import type { CardData } from "../types";

interface Props {
  card: CardData;
  flipped?: boolean;
  onClick?: () => void;
}

export default function Card({ card, onClick, flipped = false }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`
      w-[125px] h-[200px] rounded-md shadow-md overflow-hidden border-2 relative select-none
      ${onClick ? "cursor-pointer" : "pointer-events-none"}
      ${flipped ? "bg-gray-200" : "bg-white"}
    `}
      whileHover={{
        y: -20,
        scale: 1.05,
        zIndex: 50,
        transition: { duration: 0.15 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ zIndex: isHovered ? 50 : 0 }}
    >
      <img
        src={flipped ? backImage : card.image}
        alt={card.name}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </motion.div>
  );
}
