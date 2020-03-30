window.Vector3 = class Vector3 {
  /**
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   */
  constructor(x, y, z) {
    this.components = [x, y, z];
  }

  get x() {
    return this.components[0];
  }

  get y() {
    return this.components[1];
  }

  get z() {
    return this.components[2];
  }

  set x(v) {
    this.components[0] = v;
  }

  set y(v) {
    this.components[1] = v;
  }

  set z(v) {
    this.components[2] = v;
  }

  static get zero() {
    return new Vector3(0, 0, 0);
  }

  static get one() {
    return new Vector3(1, 1, 1);
  }

  /**
   * @param {Vector3|Array} v
   */
  sum(v) {
    if (v instanceof Vector3) return new Vector3(v.x + this.x, v.y + this.y, v.z + this.z);
    else return new Vector3(v[0] + this.x, v[1] + this.y, v[2] + this.z);
  }

  /**
   * @param {Vector3|Array} v
   */
  subtract(v) {
    if (v instanceof Vector3) return new Vector3(v.x - this.x, v.y - this.y, v.z - this.z);
    else return new Vector3(v[0] - this.x, v[1] - this.y, v[2] - this.z);
  }

  /**
   * @param {Vector3} v
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * @param {Vector3} v
   */
  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  unit() {
    return this.divide(this.length());
  }

  /**
   * @param {Vector3|Array|Number} v
   */
  divide(v) {
    if (v instanceof Vector3) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else if (v instanceof Array) return new Vector(this.x / v[0], this.y / v[1], this.z / v[2]);
    else return new Vector3(this.x / v, this.y / v, this.z / v);
  }

  /**
   * @param {Vector3|Array|Number} v
   */
  multiply(v) {
    if (v instanceof Vector3) return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    else if (v instanceof Vector3) return new Vector3(this.x * v[0], this.y * v[1], this.z * v[2]);
    else return new Vector3(this.x * v, this.y * v, this.z * v);
  }

  /**
   * Angle between this vector and v
   * @param {Vector3} v
   */
  angleTo(v) {
    return this.cosinSimilarity(v);
  }

  cosinSimilarity(v){
    return this.dot(v) / (this.length() * v.length());
  }

  /**
   * Copy all components of another vector
   * @param {Vector3} v
   * @returns {Vector3}
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * Return a new Vector3 instance with same components of this
   * @returns {Vector3}
   */
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
};
