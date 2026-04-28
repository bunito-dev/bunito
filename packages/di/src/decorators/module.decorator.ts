import type { Class } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import type { ModuleSchema } from '../types';
import { setClassOptionsDecoratorMetadata } from './metadata';
import { Provider } from './provider.decorator';
import type { ModuleDecoratorOptions, ProviderDecoratorOptions } from './types';

export function Module(
  options: ModuleDecoratorOptions = {},
): <TTarget extends Class>(target: TTarget, context: ClassDecoratorContext) => TTarget {
  const { token, scope, injects, ...moduleOptions } = options;

  return (target, context) => {
    if (
      !setClassOptionsDecoratorMetadata<ModuleSchema>(Module, context, {
        token,
        ...moduleOptions,
      })
    ) {
      return ConfigurationException.throw`@Module() decorator is already defined on ${target}`;
    }

    if (scope || injects) {
      setClassOptionsDecoratorMetadata<ProviderDecoratorOptions>(Provider, context, {
        token,
        scope,
        injects,
      });
    }

    return target;
  };
}
