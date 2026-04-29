import { setClassDecoratorMetadata } from '../metadata';
import type { ModuleSchema } from '../types';
import { Provider } from './provider.decorator';
import type {
  ClassDecorator,
  ModuleDecoratorOptions,
  ProviderDecoratorOptions,
} from './types';

export function Module(options: ModuleDecoratorOptions = {}): ClassDecorator {
  const { scope, injects, ...moduleOptions } = options;

  return (target, context) => {
    setClassDecoratorMetadata<ModuleSchema>(Module, 'options', context, moduleOptions);

    if (scope || injects) {
      setClassDecoratorMetadata<ProviderDecoratorOptions>(Provider, 'options', context, {
        scope,
        injects,
      });
    }

    return target;
  };
}
