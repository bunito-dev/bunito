import type { RouteSegment } from '../types';

export function processTokenizedPath(...pathTokens: string[]): RouteSegment[] {
  return pathTokens.map((part): RouteSegment => {
    if (part === '*') {
      return { kind: 'ANY' };
    }

    if (part === '**') {
      return { kind: 'WILDCARD' };
    }

    if (part.startsWith(':')) {
      return {
        kind: 'PARAM',
        name: part.slice(1),
      };
    }

    return {
      kind: 'STATIC',
      value: part,
    };
  });
}
