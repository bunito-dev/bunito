import type { Fn } from '@bunito/common';
import type { ClassPropDecoratorContext, ClassPropDecoratorMetadata } from '../types';
import { initClassDecoratorMetadata } from './init-class-decorator-metadata';

export function setClassPropDecoratorMetadata<TOptions = unknown>(
  classDecorator: Fn,
  decorator: Fn,
  context: ClassPropDecoratorContext,
  options?: TOptions,
): void {
  const metadata = initClassDecoratorMetadata(classDecorator, context);

  metadata.props ??= [];

  const { name: propKey, kind: propKind } = context;

  metadata.props.push({
    decorator,
    propKind,
    propKey: propKind === 'class' ? undefined : propKey,
    options,
  } as ClassPropDecoratorMetadata);
}
