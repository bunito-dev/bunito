import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { LogRecord } from '../types';

export interface LogFormatter {
  readonly NAME: string;

  formatLog: (params: LogRecord) => string;
}

export function LogFormatter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<LogFormatter> {
  return createExtensionDecorator(LogFormatter, options);
}
