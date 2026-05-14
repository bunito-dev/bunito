import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';

export interface ConfigReader {
  readonly NAME: string;
  getSecret?: (key: string) => Promise<unknown>;
  getValue?: (key: string) => Promise<unknown>;
}

export function ConfigReader(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<ConfigReader> {
  return createExtensionDecorator(ConfigReader, options);
}
