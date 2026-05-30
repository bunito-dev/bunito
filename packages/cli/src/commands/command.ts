import type { RawObject } from '@bunito/common';
import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { CommandBuilt } from './types';

export interface Command<TOptions extends RawObject = RawObject> {
  run: (options: TOptions) => Promise<unknown>;
  build: () => CommandBuilt;
}

export function Command<TOptions extends RawObject = RawObject>(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<Command<TOptions>> {
  return createExtensionDecorator(Command, options);
}
