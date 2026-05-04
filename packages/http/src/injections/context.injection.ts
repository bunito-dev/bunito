import type { InjectionTokenOptions } from '@bunito/container/internals';
import type { HTTPContext } from '../types';

export type Context = HTTPContext;

export function Context(): InjectionTokenOptions {
  return {
    useToken: Context,
  };
}
