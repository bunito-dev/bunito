import type { HttpPath } from '../types';

export function tokenizePath(...paths: Array<HttpPath | undefined>): string[] {
  return paths.join('/').split('/').filter(Boolean);
}
