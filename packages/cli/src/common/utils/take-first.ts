export function takeFirst<TValue>(value: TValue | TValue[]): TValue | undefined {
  return Array.isArray(value) ? value[0] : value;
}
