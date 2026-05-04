import { isString } from '@bunito/common';
import type { HTTPQuery } from '../types';

export function normalizeQuery(searchParams: URLSearchParams): HTTPQuery {
  const query: HTTPQuery = {};

  for (const [key, value] of searchParams.entries()) {
    if (Array.isArray(query[key])) {
      query[key].push(value);
    } else if (isString(query[key])) {
      query[key] = [query[key], value];
    } else {
      query[key] = value;
    }
  }

  return query;
}
