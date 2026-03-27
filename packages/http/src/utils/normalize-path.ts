import type { HttpPath } from '../types';

export function normalizePath(...paths: Array<string | undefined>): HttpPath {
  return `/${paths
    .join('/')
    .split('/')
    .filter((path) => !!path)
    .join('/')}`;
}
