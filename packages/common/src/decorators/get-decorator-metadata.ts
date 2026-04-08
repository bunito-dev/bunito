import './polyfill';
import type { Class } from '../helpers';

export function getDecoratorMetadata<TResult>(
  target: Class,
  key: PropertyKey,
): TResult | undefined {
  const metadata = target[Symbol.metadata];

  if (!metadata) {
    return;
  }

  return metadata[key] as TResult;
}
