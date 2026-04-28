import type { Fn } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import { initClassDecoratorMetadata } from './init-class-decorator-metadata';

export function setClassHandlerDecoratorMetadata<TOptions = unknown>(
  classDecorator: Fn,
  decorator: Fn,
  context: ClassMethodDecoratorContext,
  options?: TOptions,
): void {
  const metadata = initClassDecoratorMetadata(classDecorator, context);

  metadata.handlers ??= new Map();

  if (metadata.handlers.has(decorator)) {
    ConfigurationException.throw`@${decorator}() decorator is already defined for @${classDecorator}() metadata`;
    return;
  }

  const { name: propKey } = context;

  metadata.handlers.set(decorator, {
    propKey,
    options,
  });
}
