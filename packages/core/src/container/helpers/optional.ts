import type { ProviderInjectionOptions, Token } from '../types';

export function optional(token: Token): ProviderInjectionOptions {
  return {
    optional: true,
    token,
  };
}
