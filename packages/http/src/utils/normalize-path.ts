import type { HTTPPath } from '../types';

export function normalizePath(...paths: Array<string | undefined>): HTTPPath {
  const normalized = paths
    .filter((path): path is string => !!path && path !== '/')
    .join('/')
    .split('/')
    .filter(Boolean);

  return `/${normalized.join('/')}`;
}
