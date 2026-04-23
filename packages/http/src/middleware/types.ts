import type { Middleware } from './middleware';

export type ResolveMiddlewareOptions<TMiddleware extends Middleware> =
  TMiddleware extends Middleware<infer TOptions>
    ? TOptions extends Record<string, unknown>
      ? TOptions
      : never
    : never;
