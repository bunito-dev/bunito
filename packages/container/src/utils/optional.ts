import type { InjectionOptions } from '../compiler';
import type { TokenLike } from './types';

export function optional(
  token: TokenLike,
  defaultValue: unknown = null,
): InjectionOptions {
  return {
    useToken: token,
    defaultValue: defaultValue ?? null,
  };
}
