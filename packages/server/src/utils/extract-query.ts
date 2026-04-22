import { isString } from '@bunito/common';
import type { RequestQuery } from '../types';

export function extractQuery(url: URL): RequestQuery {
  const query: RequestQuery = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (!query[key]) {
      query[key] = value;
      continue;
    }

    if (isString(query[key])) {
      query[key] = [query[key], value];
      continue;
    }

    query[key].push(value);
  }

  return query;
}
