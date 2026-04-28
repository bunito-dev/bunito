import type { Class, Fn } from '@bunito/common';
import { isClass, isObject } from '@bunito/common';
import { CLASS_DECORATOR_METADATA_KEY } from '../constants';
import type { ClassDecoratorMetadata, ClassDecoratorMetadataOptions } from '../types';

export function getClassDecoratorMetadata<
  TClassOptions extends ClassDecoratorMetadataOptions = ClassDecoratorMetadataOptions,
>(target: unknown, decorator: Fn): ClassDecoratorMetadata<TClassOptions> | undefined {
  let cls: Class | undefined;

  if (isClass(target)) {
    cls = target;
  } else if (isObject(target)) {
    cls = target.constructor as Class;
  }

  if (!cls) {
    return;
  }

  return (
    cls[Symbol.metadata ?? Symbol.for('Symbol.metadata')]?.[
      CLASS_DECORATOR_METADATA_KEY
    ] as Map<Fn, ClassDecoratorMetadata<TClassOptions>> | undefined
  )?.get(decorator);
}
