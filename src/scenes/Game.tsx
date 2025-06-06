import { useEffect, useState } from "react";
import Hand from "../components/Hand";
import { cards } from "../cards";

export default function Game() {
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev >= cards.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const playerCards = cards.slice(0, visibleCards);
  const enemyCards = cards.slice(0, visibleCards);

  return (
    <div className="w-7xl h-screen border-2 mx-auto font-gamja border-red-500">
      <div className="bg-transparent w-full h-full border-2 flex flex-col items-center justify-between gap-4 pb-8 overflow-hidden">
        <Hand
          hand={enemyCards}
          flippedCards={true}
          reverse={true}
          interactive={false}
        />

        <div className="text-4xl text-white">
          {visibleCards < cards.length ? "Dealing..." : "Ready!"}
        </div>

        <Hand
          hand={playerCards}
          flippedCards={false}
          reverse={false}
          interactive={visibleCards >= cards.length}
          onCardClick={(card, index) =>
            console.log("Card clicked:", card, index)
          }
        />
      </div>
    </div>
  );
}
