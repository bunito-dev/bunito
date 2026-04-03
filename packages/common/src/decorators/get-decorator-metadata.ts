import './polyfill';
import type { Class } from '../helpers';
import { isUndefined } from '../helpers';

export function getDecoratorMetadata<TResult>(
  target: Class,
  key: PropertyKey,
): TResult | undefined {
  const metadata = target[Symbol.metadata];
  if (!metadata || isUndefined(metadata[key])) {
    return;
  }

  return metadata[key] as TResult;
}
