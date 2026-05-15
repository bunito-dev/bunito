import type { InjectionTokenOptions } from '@bunito/container';
import type { HTTPContext } from '../types';

export function CustomInjection<TValue = unknown>(
  options: (context: HTTPContext) => TValue,
): InjectionTokenOptions {
  return {
    useToken: CustomInjection,
    options,
  };
}
