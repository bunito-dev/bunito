import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';
import type { FormatLogOptions } from './types';

export interface LogFormatter {
  readonly logFormat: string;

  formatLog(params: FormatLogOptions): string;
}

export function LogFormatter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<LogFormatter> {
  return createExtensionDecorator(LogFormatter, {
    scope: 'singleton',
    ...options,
  });
}
