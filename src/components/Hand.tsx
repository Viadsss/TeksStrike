import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import { Card as CardModel } from "../Card";

interface Props {
  hand: CardModel[];
  onCardClick?: (card: CardModel, id: number, element: HTMLElement) => void;
  flippedCards?: boolean;
  reverse?: boolean;
  interactive?: boolean;
}

export default function Hand({
  hand,
  onCardClick,
  flippedCards = false,
  reverse = false,
  interactive = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [handWidth, setHandWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const virtualFanWidth = Math.min(handWidth, hand.length * 100);
  const virtualFanHeight = virtualFanWidth * 0.75;

  useEffect(() => {
    const onResize = () => {
      if (ref.current) setHandWidth(ref.current.clientWidth);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function angle(i: number) {
    const factor = hand.length / 5; // controls how much spread (orig is 4)
    let x = offsetFromCenter(hand, i) * 0.05;
    if (hand.length % 2 === 0) x += 0.025;
    return x * (Math.PI / factor);
  }

  const reverseSign = reverse ? -1 : 1;

  const variants = {
    show: ({ i }: { i: number }) => ({
      y: virtualFanHeight * (1 - Math.cos(angle(i))) * reverseSign,
      x: virtualFanWidth * Math.sin(angle(i)),
      rotate: `${angle(i) * reverseSign}rad`,
    }),
    hidden: {
      transition: { duration: 0.2 },
      y: 300 * reverseSign,
    },
  };

  const handleCardClick = (
    card: CardModel,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (onCardClick) {
      onCardClick(card, card.id, event.currentTarget);
    }
  };

  return (
    <div
      ref={ref}
      className="relative flex h-full max-h-[140px] w-full justify-center"
    >
      {hand.map((card, i) => (
        <motion.div
          custom={{ i }}
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={variants}
          key={card.id ?? i}
          transition={{ type: "tween" }}
          className="absolute"
          style={{
            transformOrigin: reverse ? "center top" : "center bottom",
            zIndex: hoveredIndex === i ? 50 : 0,
          }}
          onHoverStart={interactive ? () => setHoveredIndex(i) : undefined}
          onHoverEnd={interactive ? () => setHoveredIndex(null) : undefined}
        >
          <Card
            card={card}
            onClick={interactive ? (e) => handleCardClick(card, e) : undefined}
            allowHover={interactive}
            allowModal={interactive}
            flipped={flippedCards}
          />
        </motion.div>
      ))}
    </div>
  );
}

function offsetFromCenter(array: CardModel[], index: number): number {
  return index - Math.floor(array.length / 2);
}
