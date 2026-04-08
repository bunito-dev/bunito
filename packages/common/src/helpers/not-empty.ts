export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  switch (value) {
    case '':
    case null:
    case undefined:
      return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}
