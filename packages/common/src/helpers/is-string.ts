export function isString(value: unknown, allowEmpty = true): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  return allowEmpty || value.length > 0;
}
