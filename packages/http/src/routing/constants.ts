import type { RouteSegmentKind } from './types';

export const DECORATOR_METADATA_PREFIX = 'http#routing';

export const DECORATOR_METADATA_KEYS = {
  PATH: Symbol(`${DECORATOR_METADATA_PREFIX}:PATH`),
  REQUEST: Symbol(`${DECORATOR_METADATA_PREFIX}:REQUEST`),
  RESPONSE: Symbol(`${DECORATOR_METADATA_PREFIX}:RESPONSE`),
} as const satisfies Record<string, symbol>;

export const ROUTE_DYNAMIC_SEGMENT_ALIASES = {
  PARAM: ':',
  ANY: '*',
  WILDCARD: '**',
} as const satisfies Record<Exclude<RouteSegmentKind, 'STATIC'>, string>;

export const ROUTE_DYNAMIC_SEGMENT_KEYS = Object.keys(ROUTE_DYNAMIC_SEGMENT_ALIASES);
