import type { InjectionTokenOptions } from '@bunito/container';

export type Subject = string;

export function Subject(): InjectionTokenOptions {
  return {
    useToken: Subject,
  };
}
