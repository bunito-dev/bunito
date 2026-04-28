import type { Fn } from '@bunito/common';
import { CLASS_DECORATOR_METADATA_KEY } from '../constants';
import type { ClassDecoratorMetadata } from '../types';

export function initClassDecoratorMetadata(
  decorator: Fn,
  context: DecoratorContext,
): ClassDecoratorMetadata {
  context.metadata[CLASS_DECORATOR_METADATA_KEY] ??= new Map();

  return (
    context.metadata[CLASS_DECORATOR_METADATA_KEY] as Map<Fn, ClassDecoratorMetadata>
  ).getOrInsertComputed(decorator, () => ({}));
}
