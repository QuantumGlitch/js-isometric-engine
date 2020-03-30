// Scope function
Object.defineProperty(Object.prototype, 'let', {
    value: function(...functions) {
      functions.forEach(fn => fn(this));
      return this;
    }
  });