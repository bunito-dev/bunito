import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';

export interface ConfigReader {
  getSecret?: (key: string) => Promise<unknown>;
  getValue?: (key: string) => Promise<unknown>;
}

export function ConfigReader(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<ConfigReader> {
  return createExtensionDecorator(ConfigReader, options);
}
