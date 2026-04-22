import { DECORATOR_METADATA_KEYS } from './constants';
import type { ClassDecorator } from './types';

export function ClassOptions<TOptions = unknown>(
  groupKey: symbol,
  options?: TOptions,
): ClassDecorator {
  return (target, context) => {
    const { metadata } = context;

    metadata[DECORATOR_METADATA_KEYS.classOptions] ??= new Map();

    (metadata[DECORATOR_METADATA_KEYS.classOptions] as Map<symbol, unknown[]>)
      .getOrInsert(groupKey, [])
      .push(options);

    return target;
  };
}
