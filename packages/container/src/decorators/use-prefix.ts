import { DEFAULT_CONTROLLER_KEY } from './constants';
import type { ClassDecorator, ControllerClassOptions } from './types';
import { createClassPropDecorator } from './utils';

export function UsePrefix(prefix: string): ClassDecorator {
  return createClassPropDecorator<ControllerClassOptions, ClassDecorator>(
    DEFAULT_CONTROLLER_KEY,
    { kind: 'prefix', prefix },
  );
}
