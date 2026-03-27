import type { Class } from '@bunito/common';
import { setDecoratorMetadata } from '@bunito/common';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import type { HttpPath } from '../types';

export function Route(
  path: HttpPath,
): <TTarget extends Class>(target: TTarget, context: ClassDecoratorContext) => TTarget {
  return (target, context) => {
    setDecoratorMetadata<HttpPath>(context, HTTP_CONTROLLER_METADATA_KEYS.path, path);

    return target;
  };
}
