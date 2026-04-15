import type { RouteSegment } from '../types';

export function processTokenizedPath(...pathTokens: string[]): RouteSegment[] {
  return pathTokens.map((part): RouteSegment => {
    if (part === '*') {
      return { kind: 'any' };
    }

    if (part === '**') {
      return { kind: 'wildcard' };
    }

    if (part.startsWith(':')) {
      return {
        kind: 'param',
        name: part.slice(1),
      };
    }

    return {
      kind: 'static',
      value: part,
    };
  });
}
