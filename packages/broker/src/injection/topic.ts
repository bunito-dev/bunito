import type { InjectionTokenOptions } from '@bunito/container/internals';

export type Topic = string;

export function Topic(): InjectionTokenOptions {
  return {
    useToken: Topic,
  };
}
