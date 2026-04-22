import { ConfigurationException } from '@bunito/common';
import type { ModuleOptions } from '../types';
import { DECORATOR_METADATA_KEYS } from './constants';
import { Provider } from './provider.decorator';
import type { ClassDecorator, ModuleDecoratorOptions } from './types';

export function Module(options: ModuleDecoratorOptions = {}): ClassDecorator {
  const { injects, ...moduleOptions } = options;

  return (target, context) => {
    const { metadata } = context;

    if (metadata[DECORATOR_METADATA_KEYS.module]) {
      ConfigurationException.throw`@Module() decorator already exists in ${target}`;
    }

    metadata[DECORATOR_METADATA_KEYS.module] = moduleOptions satisfies ModuleOptions;

    if (injects) {
      Provider({ injects })(target, context);
    }

    return target;
  };
}
