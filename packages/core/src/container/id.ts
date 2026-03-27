import { resolveName } from '@bunito/common';
import type { Token } from './types';

export class Id {
  private static indexCounter = 0;

  private static objectIds = new WeakMap<object, Id>();

  private static symbolIds = new Map<symbol, Id>();

  static unique(name: string): Id {
    return new Id(name);
  }

  static for(token: Token): Id {
    switch (typeof token) {
      case 'function':
      case 'object': {
        let id = Id.objectIds.get(token);

        if (!id) {
          id = new Id(resolveName(token));
          Id.objectIds.set(token, id);
        }

        return id;
      }

      case 'string':
      case 'symbol': {
        const key = typeof token === 'string' ? Symbol.for(token) : token;
        let id = Id.symbolIds.get(key);

        if (!id) {
          id = new Id(resolveName(token));
          Id.symbolIds.set(key, id);
        }

        return id;
      }

      default:
        return new Id(resolveName(token));
    }
  }

  private constructor(
    readonly name: string,
    readonly index = ++Id.indexCounter,
  ) {
    //
  }

  toString(): string {
    return `${this.name}@${this.index}`;
  }
}
