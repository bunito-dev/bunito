import type { InjectionTokenOptions } from '@bunito/container';
import type { BrokerMessage } from '../types';

export function CustomInjection<TValue = unknown, TContext = unknown>(
  options: (message: BrokerMessage<TContext>) => TValue,
): InjectionTokenOptions {
  return {
    useToken: CustomInjection,
    options,
  };
}
