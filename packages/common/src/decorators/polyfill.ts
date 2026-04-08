if (!Symbol.metadata) {
  Object.defineProperty(Symbol, 'metadata', {
    value: Symbol('metadata'),
    enumerable: true,
    writable: false,
  });
}
