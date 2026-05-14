import type { InjectionTokenOptions } from '@bunito/container';

export type Topic = string;

export function Topic(): InjectionTokenOptions {
  return {
    useToken: Topic,
  };
}
