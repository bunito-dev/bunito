import { resolveObjectName, resolveSymbolKey } from '@bunito/common';
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
          id = new Id(resolveObjectName(token) ?? 'anonymous');
          Id.objectIds.set(token, id);
        }

        return id;
      }

      case 'string':
      case 'symbol': {
        const sym = typeof token === 'string' ? Symbol.for(token) : token;
        let id = Id.symbolIds.get(sym);

        if (!id) {
          id = new Id(resolveSymbolKey(sym) ?? 'unknown');
          Id.symbolIds.set(sym, id);
        }

        return id;
      }
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
