type TargetType = "self" | "enemy";

export class Card {
  readonly id: number;
  readonly name: string;
  readonly image: string;
  readonly modifier: number;
  readonly target: TargetType;

  constructor(
    id: number,
    name: string,
    image: string,
    modifier: number = 0,
    target: TargetType = "self"
  ) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.modifier = modifier;
    this.target = target;
  }

  getModifiedProbability(currentProb: number): number {
    return Math.max(0, Math.min(1, currentProb + this.modifier));
  }
}
