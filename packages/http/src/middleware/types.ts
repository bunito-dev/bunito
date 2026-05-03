import type { Class } from '@bunito/common';
import type { Middleware } from './middleware';

export type ResolveMiddlewareOptions<TValue> =
  TValue extends Class<Middleware<infer TOptions>> ? TOptions : never;
