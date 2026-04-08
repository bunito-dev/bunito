import { EMPTY_MAP } from './constants';

export class NestedMap<TKey, TSubKey, TValue> {
  private readonly items = new Map<TKey, Map<TSubKey, TValue>>();

  constructor(entries?: Iterable<[TKey, Iterable<[TSubKey, TValue]>]>) {
    if (!entries) {
      return;
    }

    for (const [key, items] of entries) {
      this.items.set(key, new Map(items));
    }
  }

  has(key: TKey, subKey?: TSubKey): boolean {
    if (subKey === undefined) {
      return this.items.has(key);
    }

    return this.items.get(key)?.has(subKey) === true;
  }

  get(key: TKey, subKey: TSubKey): TValue | undefined {
    return this.items.get(key)?.get(subKey);
  }

  set(key: TKey, subKey: TSubKey, value: TValue): this {
    if (!this.items.get(key)?.set(subKey, value)) {
      this.items.set(key, new Map([[subKey, value]]));
    }

    return this;
  }

  delete(key: TKey, subKey?: TSubKey): boolean {
    if (subKey === undefined) {
      return this.items.delete(key);
    }

    return this.items.get(key)?.delete(subKey) === true;
  }

  keys(): MapIterator<TKey>;
  keys(key: TKey): MapIterator<TSubKey>;
  keys(key?: TKey): MapIterator<unknown> {
    if (key === undefined) {
      return this.items.keys();
    }

    return this.items.get(key)?.keys() ?? EMPTY_MAP.keys();
  }

  values(key: TKey): MapIterator<TValue> {
    return this.items.get(key)?.values() ?? EMPTY_MAP.values();
  }

  entries(key: TKey): MapIterator<[TSubKey, TValue]> {
    return this.items.get(key)?.entries() ?? EMPTY_MAP.values();
  }
}
