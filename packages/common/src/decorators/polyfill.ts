import { isUndefined } from '../helpers';

if (isUndefined(Symbol.metadata)) {
  Object.defineProperty(Symbol, 'metadata', {
    value: Symbol('metadata'),
    enumerable: true,
    writable: false,
  });
}
