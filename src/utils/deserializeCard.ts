import { Card } from "../Card";

import img1 from "../assets/images/cards/1.png";
import img2 from "../assets/images/cards/2.png";
import img3 from "../assets/images/cards/3.png";
import img4 from "../assets/images/cards/4.png";
import img5 from "../assets/images/cards/5.png";
import img6 from "../assets/images/cards/6.png";
import img7 from "../assets/images/cards/7.png";
import img8 from "../assets/images/cards/8.png";
import img9 from "../assets/images/cards/9.png";
import img10 from "../assets/images/cards/10.png";

const imageMap: Record<number, string> = {
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  6: img6,
  7: img7,
  8: img8,
  9: img9,
  10: img10,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeCard(data: any): Card {
  const image = imageMap[data.id] ?? "";
  return new Card(data.id, data.name, image, data.modifier, data.target);
}
