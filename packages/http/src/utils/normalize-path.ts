import type { HTTPPath } from '../types';

export function normalizePath(...paths: Array<HTTPPath | undefined>): HTTPPath {
  const normalized = paths.filter<HTTPPath>(
    (path): path is HTTPPath => path !== undefined && path !== '/',
  );

  if (normalized.length === 0) {
    return '/';
  }

  return normalized.join('') as HTTPPath;
}
