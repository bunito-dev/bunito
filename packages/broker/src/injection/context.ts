import type { InjectionTokenOptions } from '@bunito/container/internals';

export type Context<TContext> = TContext;

export function Context(): InjectionTokenOptions {
  return {
    useToken: Context,
  };
}
