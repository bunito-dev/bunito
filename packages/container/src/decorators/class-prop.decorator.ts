import type { ClassPropDefinition } from '../types';
import { DECORATOR_METADATA_KEYS } from './constants';
import type { ClassPropDecorator } from './types';

export function ClassProp<TOptions = unknown>(
  groupKey: symbol,
  options?: TOptions,
): ClassPropDecorator {
  return (target, context) => {
    const { metadata, kind, name: propKey } = context;

    metadata[DECORATOR_METADATA_KEYS.classProps] ??= new Map();

    (metadata[DECORATOR_METADATA_KEYS.classProps] as Map<symbol, ClassPropDefinition[]>)
      .getOrInsert(groupKey, [])
      .push({
        kind,
        propKey,
        options,
      });

    return target;
  };
}
