import { CLASS_METADATA_KEYS } from './constants';
import type { ClassDecorator, ModuleMetadata, ProviderDecoratorOptions } from './types';
import { setProviderMetadataOptions } from './utils';

type ModuleDecoratorOptions = ModuleMetadata &
  ProviderDecoratorOptions<'global' | 'token'>;

export function Module(options: ModuleDecoratorOptions = {}): ClassDecorator {
  const { scope, injects, ...moduleMetadata } = options;

  let providerOptions: ProviderDecoratorOptions | undefined;

  if (scope || injects) {
    providerOptions = { scope, injects };
  }

  return (target, context) => {
    const { metadata } = context;

    setProviderMetadataOptions(Module, context, providerOptions);

    metadata[CLASS_METADATA_KEYS.module] = moduleMetadata;

    return target;
  };
}
