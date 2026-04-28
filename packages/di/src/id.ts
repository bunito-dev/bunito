import { inspectName, isFn, isObject, isString, RuntimeException } from '@bunito/common';
import type { TokenLike } from './types';

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

  static for(token: TokenLike): Id {
    if (Id.isInstance(token)) {
      return token;
    }

    if (isObject(token)) {
      if ('token' in token) {
        return Id.for(token.token);
      }

      return Id.forObject(token);
    } else if (isFn(token)) {
      return Id.forObject(token);
    } else if (isString(token)) {
      return Id.forString(token);
    } else {
      return Id.forSymbol(token);
    }
  }

  private static forObject(token: object): Id {
    let id = Id.objectIds.get(token);

    if (!id) {
      id = Id.unique(inspectName(token));
      Id.objectIds.set(token, id);
    }

    return id;
  }

  private static forString(token: string): Id {
    if (!token) {
      return RuntimeException.throw`Token must be a non-empty string`;
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
      const name = inspectName(token);

      id = Id.unique(name);
      Id.symbolIds.set(token, id);
    }

    return id;
  }

  constructor(
    readonly name: string,
    readonly index = 0,
  ) {}

  [Bun.inspect.custom](): string {
    return this.toString();
  }

  toString(): string {
    return this.index ? `${this.name}#${this.index}` : this.name;
  }
}
