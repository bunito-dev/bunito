import type { RouteSegmentKind } from './types';

export const ROUTING_METADATA_KEYS = {
  USES_PATH: Symbol('USES_PATH'),
  ON_REQUEST: Symbol('ON_REQUEST'),
  ON_RESPONSE: Symbol('ON_RESPONSE'),
  ON_EXCEPTION: Symbol('ON_EXCEPTION'),
} as const satisfies Record<string, symbol>;

export const ROUTE_DYNAMIC_SEGMENT_ALIASES = {
  param: ':',
  any: '*',
  wildcard: '**',
} as const satisfies Record<Exclude<RouteSegmentKind, 'static'>, string>;

export const ROUTE_DYNAMIC_SEGMENT_KEYS = Object.values(ROUTE_DYNAMIC_SEGMENT_ALIASES);
