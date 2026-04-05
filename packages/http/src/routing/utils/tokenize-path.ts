import type { RoutePath } from '../types';

export function tokenizePath(...paths: Array<RoutePath | undefined>): string[] {
  return paths.join('/').split('/').filter(Boolean);
}
