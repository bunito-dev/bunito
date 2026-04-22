export function isObject<TObject extends object = object>(
  value: unknown,
): value is TObject {
  return typeof value === 'object' && value !== null;
}
