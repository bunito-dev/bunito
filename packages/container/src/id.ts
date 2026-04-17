import { RuntimeException, resolveObjectName, resolveSymbolKey } from '@bunito/common';
import type { Token } from './types';

export class Id {
  private static uniqueCounters = new Map<string, number>();

  private static objectIds = new WeakMap<object, Id>();

  private static symbolIds = new Map<symbol, Id>();

  static isInstance(id: unknown): id is Id {
    return id instanceof Id;
  }

  static unique(name: string): Id {
    const index = (Id.uniqueCounters.get(name) ?? 0) + 1;

    Id.uniqueCounters.set(name, index);

    return new Id(name, index);
  }

  static for(token: Token): Id {
    if (Id.isInstance(token)) {
      return token;
    }

    switch (typeof token) {
      case 'function':
      case 'object':
        return Id.forObject(token);

      case 'string':
        return Id.forString(token);

      case 'symbol': {
        return Id.forSymbol(token);
      }
    }
  }

  private static forObject(token: object): Id {
    let id = Id.objectIds.get(token);

    if (!id) {
      id = Id.unique(resolveObjectName(token) ?? 'anonymous');
      Id.objectIds.set(token, id);
    }

    return id;
  }

  private static forString(token: string): Id {
    if (!token) {
      throw new RuntimeException('Token must be a non-empty string');
    }
    const key = Symbol.for(token);
    let id = Id.symbolIds.get(key);

    if (!id) {
      id = Id.unique(token);
      Id.symbolIds.set(key, id);
    }

    return id;
  }

  private static forSymbol(token: symbol): Id {
    let id = Id.symbolIds.get(token);

    if (!id) {
      const name = resolveSymbolKey(token);

      if (!name) {
        throw new RuntimeException('Token must be a non-empty symbol');
      }

      id = Id.unique(name);
      Id.symbolIds.set(token, id);
    }

    return id;
  }

  constructor(
    readonly name: string,
    readonly index = 0,
  ) {}

  toString(): string {
    return this.index ? `${this.name}#${this.index}` : this.name;
  }
}
