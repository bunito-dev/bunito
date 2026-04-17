import type {
  Any,
  EmptyFallback,
  Fn,
  ResolveField,
  StripUndefined,
} from '@bunito/common';
import type { RequestId } from '@bunito/container';
import type { Logger } from '@bunito/logger';
import type { ZodObject, ZodType, z } from 'zod';
import type {
  HTTP_CONTENT_TYPES,
  HTTP_ERROR_STATUS_CODES,
  HTTP_SUCCESS_STATUS_CODES,
} from './constants';
import type { HttpException } from './exceptions';

export type HttpPath = '/' | '/*' | '/**' | `/${string}`;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type HttpErrorStatus = keyof typeof HTTP_ERROR_STATUS_CODES;

export type HttpSuccessStatus = keyof typeof HTTP_SUCCESS_STATUS_CODES;

export type HttpStatus = HttpErrorStatus | HttpSuccessStatus;

export type HttpContentType = (typeof HTTP_CONTENT_TYPES)[number] | (string & {});

export type RouteMethod = HttpMethod | 'ALL';

export type RouteSegment =
  | { kind: 'static'; value: string }
  | { kind: 'param'; name: string }
  | { kind: 'any' }
  | { kind: 'wildcard' };

export type RouteNode = {
  segment?: RouteSegment;
  exact: boolean;
  handlers?: {
    onRequest?: OnRequestNode[];
    onResponse?: OnResponseNode[];
    onException?: OnExceptionNode[];
  };
  children?: Map<string, RouteNode>;
};

export type RouteContext<
  TData = never,
  TQuery = never,
  TParams = never,
  TBody = never,
> = {
  request: Request;
  logger?: Logger;
  url: URL;
  path: HttpPath;
  method: HttpMethod;
  contentType: HttpContentType;
  data: Partial<EmptyFallback<TData, Record<string, unknown>>>;
  query: EmptyFallback<TQuery, Record<string, string | string[]>>;
  params: EmptyFallback<TParams, Record<string, string>>;
  body: EmptyFallback<TBody, unknown>;
};

export type RouteMatches = {
  onRequest: OnRequestMatch[];
  onResponse: OnResponseMatch[];
  onException: OnExceptionMatch[];
};

export type RouteHandler = (requestId: RequestId, ...args: unknown[]) => Promise<unknown>;

export type RouteHandlerNode<TOptions> = {
  options: Required<TOptions>;
  handler: RouteHandler;
};

export type RouteHandlerMatch<TEntity> = {
  params: Record<string, string>;
} & TEntity;

// on request

export type OnRequestSchema = ZodObject<{
  params?: ZodObject;
  query?: ZodObject;
  body?: ZodType;
}>;

export type OnRequestStatic = {
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  body?: unknown;
  data?: Record<string, unknown>;
};

type ResolveOnRequestContextField<
  TArg0,
  TArg1,
  TKey extends keyof OnRequestSchema['shape'],
> = EmptyFallback<
  StripUndefined<ResolveField<TArg0 extends ZodType ? z.infer<TArg0> : TArg0, TKey>>,
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

export type OnRequestOptions = {
  method?: RouteMethod;
  path?: HttpPath;
  schema?: OnRequestSchema | null;
  priority?: 'high' | 'low' | null;
};

export type OnRequestHandler = Fn<unknown, [context: OnRequestContext<Any, Any>]>;

export type OnRequestNode = RouteHandlerNode<OnRequestOptions>;

export type OnRequestMatch = RouteHandlerMatch<OnRequestNode>;

// on response

export type OnResponseOptions = {
  method?: RouteMethod;
};

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

export type OnResponseNode = RouteHandlerNode<OnResponseOptions>;

export type OnResponseMatch = RouteHandlerMatch<OnResponseNode>;

// on exception

export type OnExceptionOptions = {
  method?: RouteMethod;
};

export type OnExceptionContextStatic = Pick<OnRequestStatic, 'data' | 'query'>;

export type OnExceptionContext<
  TArg0 extends OnExceptionContextStatic = OnExceptionContextStatic,
> = Omit<
  RouteContext<
    StripUndefined<ResolveField<TArg0, 'data'>>,
    StripUndefined<ResolveField<TArg0, 'query'>>
  >,
  'body' | 'params'
>;

export type OnExceptionHandler = Fn<
  Response | Promise<Response>,
  [exception: HttpException, context: OnExceptionContext<Any>]
>;

export type OnExceptionNode = RouteHandlerNode<OnExceptionOptions>;

export type OnExceptionMatch = OnExceptionNode;

// controller

export type ControllerOptions = {
  kind: 'path';
  path: HttpPath;
};

export type ControllerMethodOptions =
  | ({ kind: 'onRequest' } & OnRequestOptions)
  | ({ kind: 'onResponse' } & OnResponseOptions)
  | ({ kind: 'onException' } & OnExceptionOptions);
