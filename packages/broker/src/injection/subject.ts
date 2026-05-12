import type { InjectionTokenOptions } from '@bunito/container/internals';

export type Subject = string;

export function Subject(): InjectionTokenOptions {
  return {
    useToken: Subject,
  };
}
