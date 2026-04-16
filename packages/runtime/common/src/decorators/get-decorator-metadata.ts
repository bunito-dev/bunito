import type { Class } from '@bunito/common';

export function getDecoratorMetadata<TMetadata>(
  target: Class,
  key: PropertyKey,
): TMetadata | undefined {
  return target[Symbol.metadata ?? Symbol.for('Symbol.metadata')]?.[key] as TMetadata;
}
