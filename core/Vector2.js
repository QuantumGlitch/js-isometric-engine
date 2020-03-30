window.Vector2 = class Vector2 {
  /**
   * @param {Number} x
   * @param {Number} y
   */
  constructor(x, y) {
    this.components = [x, y];
  }

  get x() {
    return this.components[0];
  }

  get y() {
    return this.components[1];
  }

  set x(v) {
    this.components[0] = v;
  }

  set y(v) {
    this.components[1] = v;
  }

  static get zero() {
    return new Vector2(0, 0);
  }

  /**
   * @param {Vector2|Array} v
   * @returns {Vector2}
   */
  sum(v) {
    if (v instanceof Vector2) return new Vector2(v.x + this.x, v.y + this.y);
    else return new Vector2(v[0] + this.x, v[1] + this.y);
  }

  /**
   * Multiply all components by a scalar
   * @param {Number} v
   * @returns {Vector2}
   */
  multiply(v) {
    return new Vector2(this.x * v, this.y * v);
  }
};
