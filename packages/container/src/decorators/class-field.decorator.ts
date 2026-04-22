import { ClassProp } from './class-prop.decorator';
import type { ClassFieldDecorator } from './types';

export function ClassField<TOptions = unknown>(
  groupKey: symbol,
  options?: TOptions,
): ClassFieldDecorator {
  return ClassProp(groupKey, options);
}
