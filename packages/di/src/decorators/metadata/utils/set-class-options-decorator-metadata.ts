import type { Fn, RawObject } from '@bunito/common';
import { initClassDecoratorMetadata } from './init-class-decorator-metadata';

export function setClassOptionsDecoratorMetadata<TOptions extends RawObject>(
  decorator: Fn,
  context: ClassDecoratorContext,
  options: TOptions,
): boolean {
  const metadata = initClassDecoratorMetadata(decorator, context);

  if (metadata.options === undefined) {
    metadata.options = options;
    return true;
  }

  metadata.options = { ...metadata.options, ...options };

  return false;
}
