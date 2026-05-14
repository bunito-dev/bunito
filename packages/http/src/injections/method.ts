import type { HTTPMethod } from '@bunito/bun';
import type { InjectionTokenOptions } from '@bunito/container';

export type Method = HTTPMethod;

export function Method(): InjectionTokenOptions {
  return {
    useToken: Method,
  };
}
