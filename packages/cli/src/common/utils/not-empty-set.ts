export function notEmptySet<TValue>(items: TValue[]): Set<TValue> | null {
  return Array.isArray(items) && items.length > 0 ? new Set(items) : null;
}
