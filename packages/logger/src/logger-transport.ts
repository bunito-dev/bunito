import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { LogRecord } from './types';

export interface LoggerTransport {
  readonly NAME: string;

  write: (params: LogRecord) => void;
}

export function LoggerTransport(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<LoggerTransport> {
  return createExtensionDecorator(LoggerTransport, options);
}
