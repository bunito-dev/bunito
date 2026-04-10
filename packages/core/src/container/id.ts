import { resolveObjectName, resolveSymbolKey } from '@bunito/common';
import type { Token } from './types';

export class Id {
  private static nameIndexes = new Map<string, number>();

  private static objectIds = new WeakMap<object, Id>();

  private static symbolIds = new Map<symbol, Id>();

  static isInstance(id: unknown): id is Id {
    return id instanceof Id;
  }

  static unique(name: string): Id {
    const index = (Id.nameIndexes.get(name) ?? 0) + 1;

    Id.nameIndexes.set(name, index);

    return new Id(name, index);
  }

  static for(token: Token): Id {
    if (Id.isInstance(token)) {
      return token;
    }

    switch (typeof token) {
      case 'function':
      case 'object': {
        let id = Id.objectIds.get(token);

        if (!id) {
          id = Id.unique(resolveObjectName(token) ?? 'anonymous');
          Id.objectIds.set(token, id);
        }

        return id;
      }

      case 'string':
      case 'symbol': {
        const sym = typeof token === 'string' ? Symbol.for(token) : token;
        let id = Id.symbolIds.get(sym);

        if (!id) {
          id = Id.unique(resolveSymbolKey(sym) ?? 'unknown');
          Id.symbolIds.set(sym, id);
        }

        return id;
      }
    }
  }

  constructor(
    readonly name: string,
    readonly index = 0,
  ) {}

  toString(): string {
    return this.index ? `${this.name}#${this.index}` : this.name;
  }
}
