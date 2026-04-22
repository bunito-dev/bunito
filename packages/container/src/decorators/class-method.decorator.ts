import type { Fn } from '@bunito/common';
import { ClassProp } from './class-prop.decorator';
import type { ClassMethodDecorator } from './types';

export function ClassMethod<TPattern extends Fn = Fn, TOptions = unknown>(
  groupKey: symbol,
  options?: TOptions,
): ClassMethodDecorator<TPattern> {
  return ClassProp(groupKey, options);
}
