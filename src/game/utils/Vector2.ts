export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mult(n: number): Vector2 {
    return new Vector2(this.x * n, this.y * n);
  }

  div(n: number): Vector2 {
    return new Vector2(this.x / n, this.y / n);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2 {
    const m = this.mag();
    if (m !== 0) {
      return this.div(m);
    }
    return new Vector2(0, 0);
  }

  limit(max: number): Vector2 {
    if (this.mag() > max) {
      return this.normalize().mult(max);
    }
    return new Vector2(this.x, this.y);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}
