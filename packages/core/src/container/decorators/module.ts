import type { Class } from '@bunito/common';
import { setDecoratorMetadata } from '@bunito/common';
import { MODULE_METADATA_KEY } from '../constants';
import type { ClassProviderOptions, ModuleOptions } from '../types';
import { Provider } from './provider';

export type ModuleDecoratorOptions = Omit<ModuleOptions, 'extends'> &
  Pick<ClassProviderOptions, 'injects'>;

export function Module(
  options: ModuleDecoratorOptions = {},
): <TTarget extends Class>(target: TTarget, context: ClassDecoratorContext) => TTarget {
  const { injects, ...moduleOptions } = options;

  return (target, context) => {
    setDecoratorMetadata<ModuleOptions>(context, MODULE_METADATA_KEY, moduleOptions);

    return Provider({
      scope: 'module',
      injects,
    })(target, context);
  };
}
