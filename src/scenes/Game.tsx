import Hand from "../components/Hand";

import { cards } from "../cards";

export default function Game() {
  return (
    <div className="w-7xl h-screen border-2 mx-auto font-gamja border-red-500">
      <div className="bg-transparent w-full h-full border-2 flex flex-col items-center justify-between gap-4 pb-8 overflow-hidden">
        <Hand
          hand={cards}
          flippedCards={true}
          reverse={true}
          interactive={false}
          onCardClick={(card, index) =>
            console.log("Card clicked:", card, index)
          }
        />

        <div className="text-4xl text-white">
          {/* card placeholder for player 1 here */}
          {/* card placeholder for the enemy here */}
        </div>

        <Hand
          hand={cards}
          flippedCards={false}
          reverse={false}
          onCardClick={(card, index) =>
            console.log("Card clicked:", card, index)
          }
        />
      </div>
    </div>
  );
}
