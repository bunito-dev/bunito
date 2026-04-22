import type { HttpPath } from '@bunito/server';

export function normalizePath(...parts: (string | undefined)[]): HttpPath {
  const path = parts.join('/').split('/').filter(Boolean);

  return `/${path.join('/')}`;
}
