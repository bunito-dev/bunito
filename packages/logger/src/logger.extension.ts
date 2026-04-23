import type { Class } from '@bunito/common';
import type {
  ClassDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { Extension } from '@bunito/container/internals';
import { LOGGER_EXTENSION } from './constants';
import type { FormatLogOptions, LogFormat } from './types';

export interface LoggerExtension {
  formatLog(options: FormatLogOptions): string;
}

export function LoggerExtension(
  name: LogFormat,
  options: ProviderDecoratorOptions<'scope' | 'global' | 'token'> = {},
): ClassDecorator<Class<LoggerExtension>> {
  return Extension('LoggerExtension', LOGGER_EXTENSION, name.toLowerCase(), {
    scope: 'singleton',
    ...options,
  });
}
