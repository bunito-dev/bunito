import type { ClassDecorator } from '@bunito/container';
import { createClassPropDecorator } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import type { CORSOptions, ControllerClassOptions } from '../types';

export function UseCORS(options: CORSOptions = {}): ClassDecorator {
  return createClassPropDecorator<ControllerClassOptions, ClassDecorator>(
    HTTP_CONTROLLER_KEY,
    { kind: 'cors', options: options ?? {} },
  );
}
