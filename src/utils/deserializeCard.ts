// utils/deserializeCard.ts
import { Card } from "../Card"; // Adjust path

// let counter = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeCard(data: any): Card {
  return new Card(data.id, data.name, data.image, data.modifier, data.target);
}
