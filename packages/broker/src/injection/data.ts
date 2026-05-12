import type { InjectionTokenOptions } from '@bunito/container/internals';

export type Data<TData = unknown> = TData;

export function Data(): InjectionTokenOptions {
  return {
    useToken: Data,
  };
}
