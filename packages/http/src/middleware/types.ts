import type { Class, EmptyObject, RawObject } from '@bunito/common';
import type { HTTPContext } from '../types';
import type { Middleware } from './middleware';

export type MiddlewareContext<TOptions extends RawObject = EmptyObject> = HTTPContext &
  Partial<TOptions>;

export type MiddlewareHandlers = Required<{
  [TKey in keyof Middleware]: {
    options: RawObject;
    handler: Exclude<Middleware[TKey], undefined>;
  }[];
}>;

export type ResolveMiddlewareOptions<TValue> =
  TValue extends Class<infer TMiddleware>
    ? TMiddleware extends Middleware<infer TOptions>
      ? TOptions
      : never
    : never;
