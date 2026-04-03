export function resolveSymbolKey(value: symbol): string | undefined {
  let key = Symbol.keyFor(value);

  if (!key) {
    key = value.toString().slice(7, -1);
  }

  return key ? key : undefined;
}
