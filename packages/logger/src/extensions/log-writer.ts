import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';

export interface LogWriter {
  readonly NAME: string;

  writeLog: (buffer: string) => void;
}

export function LogWriter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<LogWriter> {
  return createExtensionDecorator(LogWriter, options);
}
