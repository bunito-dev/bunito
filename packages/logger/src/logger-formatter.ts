import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';
import type { LogRecord } from './types';

export interface LoggerFormatter {
  readonly NAME: string;

  formatLog: (params: LogRecord) => string;
}

export function LoggerFormatter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<LoggerFormatter> {
  return createExtensionDecorator(LoggerFormatter, options);
}
