/**
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} z
 * @returns {Vector3}
 */
function Vector3(x, y, z) {
  if (this instanceof Vector3) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    return this;
  } else return new Vector3(x, y, z);
}

Vector3.prototype = {
  negative: function() {
    return new Vector3(-this.x, -this.y, -this.z);
  },
  add: function(v) {
    if (v instanceof Vector3) return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    else if (v instanceof Array) return new Vector3(this.x + v[0], this.y + v[1], this.z + v[2]);
    else return new Vector3(this.x + v, this.y + v, this.z + v);
  },
  subtract: function(v) {
    if (v instanceof Vector3) return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    else if (v instanceof Array) return new Vector3(this.x - v[0], this.y - v[1], this.z - v[2]);
    else return new Vector3(this.x - v, this.y - v, this.z - v);
  },
  multiply: function(v) {
    if (v instanceof Vector3) return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    else if (v instanceof Array) return new Vector3(this.x * v[0], this.y * v[1], this.z * v[2]);
    else return new Vector3(this.x * v, this.y * v, this.z * v);
  },
  divide: function(v) {
    if (v instanceof Vector3) return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
    else if (v instanceof Array) return new Vector3(this.x / v[0], this.y / v[1], this.z / v[2]);
    else return new Vector3(this.x / v, this.y / v, this.z / v);
  },
  equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  },
  unit: function() {
    return this.divide(this.length());
  },
  min: function() {
    return Math.min(Math.min(this.x, this.y), this.z);
  },
  max: function() {
    return Math.max(Math.max(this.x, this.y), this.z);
  },
  toAngles: function() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  },
  angleTo: function(a) {
    return Math.acos(this.cosinSimilarity(a));
  },
  cosinSimilarity(v) {
    return this.dot(v) / (this.length() * v.length());
  },
  toArray: function(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },
  clone: function() {
    return new Vector3(this.x, this.y, this.z);
  },
  copy: function(v) {
    if (v instanceof Vector3) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
    } else {
      this.x = v[0];
      this.y = v[1];
      this.z = v[2];
    }
    return this;
  }
};

Vector3.negative = function(a, b) {
  b.x = -a.x;
  b.y = -a.y;
  b.z = -a.z;
  return b;
};
Vector3.add = function(a, b, c) {
  if (b instanceof Vector3) {
    c.x = a.x + b.x;
    c.y = a.y + b.y;
    c.z = a.z + b.z;
  } else {
    c.x = a.x + b;
    c.y = a.y + b;
    c.z = a.z + b;
  }
  return c;
};
Vector3.subtract = function(a, b, c) {
  if (b instanceof Vector3) {
    c.x = a.x - b.x;
    c.y = a.y - b.y;
    c.z = a.z - b.z;
  } else {
    c.x = a.x - b;
    c.y = a.y - b;
    c.z = a.z - b;
  }
  return c;
};
Vector3.multiply = function(a, b, c) {
  if (b instanceof Vector3) {
    c.x = a.x * b.x;
    c.y = a.y * b.y;
    c.z = a.z * b.z;
  } else {
    c.x = a.x * b;
    c.y = a.y * b;
    c.z = a.z * b;
  }
  return c;
};
Vector3.divide = function(a, b, c) {
  if (b instanceof Vector3) {
    c.x = a.x / b.x;
    c.y = a.y / b.y;
    c.z = a.z / b.z;
  } else {
    c.x = a.x / b;
    c.y = a.y / b;
    c.z = a.z / b;
  }
  return c;
};
Vector3.cross = function(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector3.unit = function(a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector3.fromAngles = function(theta, phi) {
  return new Vector3(
    Math.cos(theta) * Math.cos(phi),
    Math.sin(phi),
    Math.sin(theta) * Math.cos(phi)
  );
};
Vector3.randomDirection = function() {
  return new Vector3.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector3.min = function(a, b) {
  return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector3.max = function(a, b) {
  return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector3.lerp = function(a, b, fraction) {
  return b
    .subtract(a)
    .multiply(fraction)
    .add(a);
};
Vector3.fromArray = function(a) {
  return new Vector3(a[0], a[1], a[2]);
};
Vector3.angleBetween = function(a, b) {
  return a.angleTo(b);
};
