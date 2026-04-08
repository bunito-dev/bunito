import type { RequestId } from '@bunito/core';
import type { HttpMethod } from '../types';

export type RoutePath = `/${string}`;

export type RouteParams = Record<string, string>;

export type RouteHandler = (requestId: RequestId, ...args: unknown[]) => Promise<unknown>;

export type RouteSegment =
  | { kind: 'static'; value: string }
  | { kind: 'param'; name: string }
  | { kind: 'any' }
  | { kind: 'wildcard' };

export type RouteSegmentKind = RouteSegment['kind'];

export type RouteNode = {
  segment?: RouteSegment;
  exact: boolean;
  entities?: {
    requests?: RouteRequestEntity[];
    responses?: RouteResponseEntity[];
    errors?: RouteErrorEntity[];
  };
  children?: Map<string, RouteNode>;
};

export type RouteMatches = {
  requests: RouteRequestMatch[];
  responses: RouteResponseMatch[];
  errors: RouteErrorMatch[];
};

export type RouteBaseOptions = {
  method?: HttpMethod;
};

export type RouteBaseEntity<TOptions> = {
  name: string;
  options: Required<TOptions>;
  handler: RouteHandler;
};

export type RouteBaseMatch<TEntity> = {
  params: RouteParams;
} & TEntity;

// on request

export type RouteRequestOptions = RouteBaseOptions & {
  path?: RoutePath;
};

export type RouteRequestOptionsLike<TOmit extends keyof RouteRequestOptions = never> =
  | Omit<RouteRequestOptions, TOmit>
  | RoutePath;

export type RouteRequestDefinition = {
  propKey: PropertyKey;
  options: Required<RouteRequestOptions>;
};
export type RouteRequestEntity = RouteBaseEntity<RouteRequestOptions>;

export type RouteRequestMatch = RouteBaseMatch<RouteRequestEntity>;

// on response

export type RouteResponseOptions = RouteBaseOptions;

export type RouteResponseDefinition = {
  propKey: PropertyKey;
  options: Required<RouteResponseOptions>;
};

export type RouteResponseEntity = RouteBaseEntity<RouteResponseOptions>;

export type RouteResponseMatch = RouteBaseMatch<RouteResponseEntity>;

// on error

export type RouteErrorOptions = RouteBaseOptions;

export type RouteErrorDefinition = {
  propKey: PropertyKey;
  options: Required<RouteResponseOptions>;
};

export type RouteErrorEntity = RouteBaseEntity<RouteErrorOptions>;

export type RouteErrorMatch = RouteErrorEntity;

export type RouteContext = {
  request: Request;
  path: RoutePath;
  method: HttpMethod;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  body: unknown;
  data: Record<string, unknown>;
};

export type InspectedRoute = {
  path: RoutePath;
  method: HttpMethod;
  onRequest?: string[];
  onResponse?: string[];
  onError?: string[];
};
