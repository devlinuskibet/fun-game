import { Vector2 } from './Vector2';

export function checkCircleCollision(pos1: Vector2, r1: number, pos2: Vector2, r2: number): boolean {
  const dist = pos1.sub(pos2).mag();
  return dist < (r1 + r2);
}
