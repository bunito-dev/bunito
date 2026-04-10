import { isString } from '@bunito/common';

export function normalizeSearchParams(
  searchParams: URLSearchParams,
): Record<string, string | string[]> {
  return searchParams
    .entries()
    .reduce<Record<string, string | string[]>>((result, [key, value]) => {
      if (result[key] === undefined) {
        result[key] = value;
      } else if (isString(result[key])) {
        result[key] = [result[key], value];
      } else if (Array.isArray(result[key])) {
        result[key].push(value);
      }

      return result;
    }, {});
}
