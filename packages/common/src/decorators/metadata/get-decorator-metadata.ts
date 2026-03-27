import './polyfills';
import type { Class } from '../../utils';

export function getDecoratorMetadata<TValue>(
  target: Class,
  key: PropertyKey,
): TValue | undefined {
  return target[Symbol.metadata]?.[key] as TValue | undefined;
}
