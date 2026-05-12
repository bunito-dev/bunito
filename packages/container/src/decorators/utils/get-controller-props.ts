import type { Class } from '@bunito/common';
import { DEFAULT_CONTROLLER_KEY } from '../constants';
import type { ClassPropMetadata, ControllerClassOptions } from '../types';
import { getClassMetadata } from './get-class-metadata';

export function getControllerProps(
  classRef: Class,
  propKey: symbol,
): ClassPropMetadata<ControllerClassOptions>[] | undefined {
  let result = getClassMetadata(classRef, 'props')?.get(DEFAULT_CONTROLLER_KEY);

  const props = getClassMetadata(classRef, 'props')?.get(propKey);

  if (props) {
    result = result ? [...result, ...props] : props;
  }

  return result as ClassPropMetadata<ControllerClassOptions>[] | undefined;
}
