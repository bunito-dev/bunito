import { ContainerException } from '../container.exception';
import { MODULE_METADATA_KEY, PROVIDER_METADATA_KEY } from './constants';
import type {
  ClassDecorator,
  ModuleDecoratorOptions,
  ModuleMetadata,
  ProviderMetadata,
} from './types';

export function Module(options: ModuleDecoratorOptions = {}): ClassDecorator {
  return (target, context) => {
    const { metadata } = context;

    if (metadata[MODULE_METADATA_KEY]) {
      return ContainerException.throw`@Module() decorator can only be applied once`;
    }

    const providerMetadata = metadata[PROVIDER_METADATA_KEY] as
      | ProviderMetadata
      | undefined;

    if (providerMetadata?.options) {
      return ContainerException.throw`@Module() decorator conflicts with @${providerMetadata.decorator ?? 'Provider'}() decorator`;
    }

    const { scope, injects, ...moduleMetadata } = options;

    metadata[MODULE_METADATA_KEY] = moduleMetadata satisfies ModuleMetadata;

    if (scope || injects) {
      metadata[PROVIDER_METADATA_KEY] ??= {};
      (metadata[PROVIDER_METADATA_KEY] as ProviderMetadata).options = { scope, injects };
    }

    return target;
  };
}
