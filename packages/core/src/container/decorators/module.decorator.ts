import type { Class, ClassDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type {
  ModuleDecoratorOptions,
  ModuleOptions,
  ProviderDecoratorOptions,
} from '../types';

export function Module<TModule extends Class>(
  options?: ModuleDecoratorOptions,
): ClassDecorator<TModule> {
  const { scope, injects, ...moduleOptions } = options ?? {};

  return (target, { metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.MODULE_OPTIONS] =
      moduleOptions satisfies ModuleOptions;

    if (scope || injects) {
      metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS] = {
        scope,
        inject: injects,
      } satisfies ProviderDecoratorOptions;
    }

    return target;
  };
}
