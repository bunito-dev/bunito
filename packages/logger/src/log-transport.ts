import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { LogRecord } from './types';

export interface LogTransport {
  readonly NAME: string;

  write: (params: LogRecord) => void;
}

export function LogTransport(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<LogTransport> {
  return createExtensionDecorator(LogTransport, options);
}
