import type { HTTPMethod } from '@bunito/bun';
import type { InjectionTokenOptions } from '@bunito/container/internals';

export type Method = HTTPMethod;

export function Method(): InjectionTokenOptions {
  return {
    useToken: Method,
  };
}
