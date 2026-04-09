import type { Logger, RequestId } from '@bunito/core';
import type { ZodObject, ZodType, z } from 'zod';
import type { HttpMethod } from '../types';

type ResolveZodLike<TValue, TZod, TDefault = unknown> = TValue extends TZod
  ? z.infer<TValue>
  : TValue extends TDefault
    ? TValue
    : TDefault;

export type RoutePath = `/${string}`;

export type RouteParams = Record<string, string>;

export type RouteQuery = Record<string, string | string[]>;

export type RouteData = Record<string, unknown>;

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

export type RouteHandlerEntity<TOptions> = {
  name: string;
  options: Required<TOptions>;
  handler: RouteHandler;
};

export type RouteHandlerMatch<TEntity> = {
  params: RouteParams;
} & TEntity;

export type RouteContext<TData extends RouteData = RouteData> = {
  request: Request;
  logger: Logger;
  url: URL;
  path: RoutePath;
  method: HttpMethod;
  data: Partial<TData>;
};

export type RouteState = {
  query?: RouteQuery;
  body?: unknown;
};

export type InspectedRoute = {
  path: RoutePath;
  method: RouteMethod;
  onRequest?: string[];
  onResponse?: string[];
  onError?: string[];
};

// on request

export type OnRequestSchema<
  TZodObject extends ZodObject = ZodObject,
  TZodType extends ZodType = ZodType,
> = {
  params?: TZodObject | RouteParams;
  query?: TZodObject | RouteQuery;
  body?: TZodType | unknown;
};

export type OnRequestContext<
  TSchema extends OnRequestSchema = OnRequestSchema<never, never>,
  TData extends RouteData = RouteData,
> = RouteContext<TData> & {
  params: ResolveZodLike<TSchema['params'], ZodObject, RouteParams>;
  query: ResolveZodLike<TSchema['query'], ZodObject, RouteQuery>;
  body: ResolveZodLike<TSchema['body'], ZodType>;
};

export type OnRequestOptions = RouteHandlerOptions & {
  path?: RoutePath;
  params?: ZodObject | null;
  query?: ZodObject | null;
  body?: ZodType | null;
};

export type OnRequestOptionsLike<TOmit extends keyof OnRequestOptions = never> = Omit<
  OnRequestOptions,
  TOmit
>;

export type OnRequestDefinition = {
  propKey: PropertyKey;
  options: Required<OnRequestOptions>;
};
export type OnRequestEntity = RouteHandlerEntity<OnRequestOptions>;

export type OnRequestMatch = RouteHandlerMatch<OnRequestEntity>;

// on response

export type OnResponseSchema<TZodObject extends ZodObject = ZodObject> = {
  params?: TZodObject | RouteParams;
  query?: TZodObject | RouteQuery;
};

export type OnResponseContext<
  TSchema extends OnResponseSchema = OnResponseSchema<never>,
  TData extends RouteData = RouteData,
> = RouteContext<TData> & {
  params: ResolveZodLike<TSchema['params'], ZodObject, RouteParams>;
  query: ResolveZodLike<TSchema['query'], ZodObject, RouteQuery>;
};

export type OnResponseOptions = RouteHandlerOptions & {
  params?: ZodObject | null;
  query?: ZodObject | null;
};

export type OnResponseDefinition = {
  propKey: PropertyKey;
  options: Required<OnResponseOptions>;
};

export type OnResponseEntity = RouteHandlerEntity<OnResponseOptions>;

export type OnResponseMatch = RouteHandlerMatch<OnResponseEntity>;

// on error

export type OnExceptionContext<TData extends RouteData = RouteData> = RouteContext<TData>;

export type OnExceptionOptions = RouteHandlerOptions;

export type OnExceptionDefinition = {
  propKey: PropertyKey;
  options: Required<OnExceptionOptions>;
};

export type OnExceptionEntity = RouteHandlerEntity<OnExceptionOptions>;

export type OnExceptionMatch = OnExceptionEntity;
