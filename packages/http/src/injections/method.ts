import type { HTTPMethod } from '@bunito/bun';
import type { InjectionTokenOptions } from '@bunito/container';

export type Method = Omit<HTTPMethod, 'OPTIONS'>;

export function Method(): InjectionTokenOptions {
  return {
    useToken: Method,
  };
}
