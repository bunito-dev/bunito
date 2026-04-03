import type { InjectionOptions, Token } from '../types';

export function optional(token: Token): InjectionOptions {
  return {
    token,
    optional: true,
  };
}
