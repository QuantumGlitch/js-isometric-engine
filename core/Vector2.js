/**
 * @param  {Number} x
 * @param  {Number} y
 * @returns {Vector2}
 */
function Vector2(x, y) {
  if (this instanceof Vector2) {
    this.x = x || 0;
    this.y = y || 0;
    return this;
  } else return new Vector2(x, y);
}

Vector2.prototype = {
  negative: function() {
    return new Vector2(-this.x, -this.y);
  },
  add: function(v) {
    if (v instanceof Vector2) return new Vector2(this.x + v.x, this.y + v.y);
    else if (v instanceof Array) return new Vector2(this.x + v[0], this.y + v[1]);
    else return new Vector2(this.x + v, this.y + v);
  },
  subtract: function(v) {
    if (v instanceof Vector2) return new Vector2(this.x - v.x, this.y - v.y);
    else if (v instanceof Array) return new Vector2(this.x - v[0], this.y - v[1]);
    else return new Vector2(this.x - v, this.y - v);
  },
  multiply: function(v) {
    if (v instanceof Vector2) return new Vector2(this.x * v.x, this.y * v.y);
    else if (v instanceof Array) return new Vector2(this.x * v[0], this.y * v[1]);
    else return new Vector2(this.x * v, this.y * v);
  },
  divide: function(v) {
    if (v instanceof Vector2) return new Vector2(this.x / v.x, this.y / v.y);
    else if (v instanceof Array) return new Vector2(this.x / v[0], this.y / v[1]);
    else return new Vector2(this.x / v, this.y / v);
  },
  equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function(v) {
    return new Vector2(
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
    return new Vector2(this.x, this.y);
  },
  copy: function(v) {
    if (v instanceof Vector2) {
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

Vector2.negative = function(a, b) {
  b.x = -a.x;
  b.y = -a.y;
  b.z = -a.z;
  return b;
};
Vector2.add = function(a, b, c) {
  if (b instanceof Vector2) {
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
Vector2.subtract = function(a, b, c) {
  if (b instanceof Vector2) {
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
Vector2.multiply = function(a, b, c) {
  if (b instanceof Vector2) {
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
Vector2.divide = function(a, b, c) {
  if (b instanceof Vector2) {
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
Vector2.cross = function(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector2.unit = function(a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector2.fromAngles = function(theta, phi) {
  return new Vector2(
    Math.cos(theta) * Math.cos(phi),
    Math.sin(phi),
    Math.sin(theta) * Math.cos(phi)
  );
};
Vector2.randomDirection = function() {
  return new Vector2.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector2.min = function(a, b) {
  return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
};
Vector2.max = function(a, b) {
  return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
};
Vector2.lerp = function(a, b, fraction) {
  return b
    .subtract(a)
    .multiply(fraction)
    .add(a);
};
Vector2.fromArray = function(a) {
  return new Vector2(a[0], a[1]);
};
Vector2.angleBetween = function(a, b) {
  return a.angleTo(b);
};
