import type { InjectionTokenOptions } from '@bunito/container';

export type Context<TContext> = TContext;

export function Context(): InjectionTokenOptions {
  return {
    useToken: Context,
  };
}
