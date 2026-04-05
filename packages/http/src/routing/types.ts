import type { RequestId } from '@bunito/core';
import type { HttpMethod } from '../types';

export type RoutePath = `/${string}`;

export type RouteBaseOptions = {
  method?: HttpMethod;
};

export type RouteRequestOptions = RouteBaseOptions & {
  path?: RoutePath;
};

export type RouteRequestOptionsLike = Omit<RouteRequestOptions, 'method'> | RoutePath;

export type RouteRequestDefinition = {
  propKey: PropertyKey;
  options: Required<RouteRequestOptions>;
};

export type RouteResponseOptions = RouteBaseOptions;

export type RouteResponseDefinition = {
  propKey: PropertyKey;
  options: Required<RouteResponseOptions>;
};

export type RouteSegment =
  | { kind: 'STATIC'; value: string }
  | { kind: 'PARAM'; name: string }
  | { kind: 'ANY' }
  | { kind: 'WILDCARD' };

export type RouteSegmentKind = RouteSegment['kind'];

export type RouteHandler = (requestId: RequestId, ...args: unknown[]) => Promise<unknown>;

export type RouteNode = {
  segment?: RouteSegment;
  exact: boolean;
  requests?: RouteNodeRequestEntity[];
  responses?: RouteNodeResponseEntity[];
  children?: Map<string, RouteNode>;
};

export type RouteNodeBaseEntity<TOptions> = {
  options: Required<TOptions>;
  handler: RouteHandler;
};

export type RouteNodeRequestEntity = RouteNodeBaseEntity<RouteRequestOptions>;

export type RouteNodeResponseEntity = RouteNodeBaseEntity<RouteResponseOptions>;

export type RouteParams = Record<string, string>;

export type RouteBaseMatch<TEntity> = {
  params: RouteParams;
} & TEntity;

export type RouteRequestMatch = RouteBaseMatch<RouteNodeRequestEntity>;

export type RouteResponseMatch = RouteBaseMatch<RouteNodeResponseEntity>;
