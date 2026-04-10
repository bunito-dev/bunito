import type {
  Any,
  EmptyFallback,
  Fn,
  ResolveField,
  StripUndefined,
  UnwrapZodType,
} from '@bunito/common';
import type { Logger, RequestId } from '@bunito/core';
import type { ZodObject, ZodType } from 'zod';
import type { HttpException } from '../exceptions';
import type { HttpMethod } from '../types';

export type RoutePath = '/' | '/*' | '/**' | `/${string}`;

export type RouteMethod = HttpMethod | 'ALL';

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
  handlers?: {
    onRequest?: OnRequestEntity[];
    onResponse?: OnResponseEntity[];
    onException?: OnExceptionEntity[];
  };
  children?: Map<string, RouteNode>;
};

export type RouteMatches = {
  onRequest: OnRequestMatch[];
  onResponse: OnResponseMatch[];
  onException: OnExceptionMatch[];
};

export type RouteHandlerOptions = {
  method?: RouteMethod;
};

export type RouteHandlerEntity<TOptions> = InspectedRouteHandler & {
  options: Required<TOptions>;
  handler: RouteHandler;
};

export type RouteHandlerMatch<TEntity> = {
  params: Record<string, string>;
} & TEntity;

export type InspectedRoute = {
  path: RoutePath;
  method: RouteMethod;
  onRequest?: InspectedRouteHandler[];
  onResponse?: InspectedRouteHandler[];
  onError?: InspectedRouteHandler[];
};

export type InspectedRouteHandler = {
  controllerName: string;
  propKey: PropertyKey;
};

export type RouteContext<
  TData = never,
  TQuery = never,
  TParams = never,
  TBody = never,
> = {
  request: Request;
  logger: Logger;
  url: URL;
  path: RoutePath;
  method: HttpMethod;
  data: Partial<EmptyFallback<TData, Record<string, unknown>>>;
  query: EmptyFallback<TQuery, Record<string, string | string[]>>;
  params: EmptyFallback<TParams, Record<string, string>>;
  body: EmptyFallback<TBody, unknown>;
};

// on request

export type OnRequestSchemaShape = {
  params?: ZodObject;
  query?: ZodObject;
  body?: ZodType;
};

export type OnRequestSchema = ZodObject<OnRequestSchemaShape>;

export type OnRequestStatic = {
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  body?: unknown;
  data?: Record<string, unknown>;
};

type ResolveOnRequestContextField<
  TArg0,
  TArg1,
  TKey extends keyof OnRequestSchemaShape,
> = EmptyFallback<
  StripUndefined<ResolveField<UnwrapZodType<TArg0>, TKey>>,
  StripUndefined<ResolveField<TArg1, TKey>>
>;

export type OnRequestContext<
  TArg0 extends OnRequestStatic | OnRequestSchema = OnRequestStatic,
  TArg1 extends OnRequestStatic = OnRequestStatic,
> = RouteContext<
  EmptyFallback<
    StripUndefined<ResolveField<TArg0, 'data'>>,
    StripUndefined<ResolveField<TArg1, 'data'>>
  >,
  ResolveOnRequestContextField<TArg0, TArg1, 'query'>,
  ResolveOnRequestContextField<TArg0, TArg1, 'params'>,
  ResolveOnRequestContextField<TArg0, TArg1, 'body'>
>;

export type OnRequestHandler = Fn<unknown, [context: OnRequestContext<Any, Any>]>;

export type OnRequestOptions = RouteHandlerOptions & {
  path?: RoutePath;
  schema?: OnRequestSchema | null;
};

export type OnRequestDefinition = {
  propKey: PropertyKey;
  options: Required<OnRequestOptions>;
};
export type OnRequestEntity = RouteHandlerEntity<OnRequestOptions>;

export type OnRequestMatch = RouteHandlerMatch<OnRequestEntity>;

// on response

export type OnResponseOptions = RouteHandlerOptions;

export type OnResponseDefinition = {
  propKey: PropertyKey;
  options: Required<OnResponseOptions>;
};

export type OnResponseEntity = RouteHandlerEntity<OnResponseOptions>;

export type OnResponseMatch = RouteHandlerMatch<OnResponseEntity>;

export type OnResponseContextStatic = Pick<OnRequestStatic, 'data' | 'query' | 'params'>;

export type OnResponseContext<
  TArg0 extends OnResponseContextStatic = OnResponseContextStatic,
> = Omit<
  RouteContext<
    StripUndefined<ResolveField<TArg0, 'data'>>,
    StripUndefined<ResolveField<TArg0, 'query'>>,
    StripUndefined<ResolveField<TArg0, 'params'>>
  >,
  'body'
>;

export type OnResponseHandler = Fn<
  Response | Promise<Response>,
  [data: Any, context: OnResponseContext<Any>]
>;

// on error

export type OnExceptionOptions = RouteHandlerOptions;

export type OnExceptionDefinition = {
  propKey: PropertyKey;
  options: Required<OnExceptionOptions>;
};

export type OnExceptionEntity = RouteHandlerEntity<OnExceptionOptions>;

export type OnExceptionMatch = OnExceptionEntity;

export type OnExceptionContextStatic = Pick<OnRequestStatic, 'data' | 'query'>;

export type OnExceptionContext<
  TArg0 extends OnExceptionContextStatic = OnExceptionContextStatic,
> = Omit<
  RouteContext<
    StripUndefined<ResolveField<TArg0, 'data'>>,
    StripUndefined<ResolveField<TArg0, 'query'>>,
    StripUndefined<ResolveField<TArg0, 'params'>>
  >,
  'body' | 'params'
>;

export type OnExceptionHandler = Fn<
  Response | Promise<Response>,
  [exception: HttpException, context: OnResponseContext<Any>]
>;
