import type { Fn } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import { CLASS_METADATA_KEY } from '../constants';
import type { ClassMetadata, ClassMetadataKind } from '../types';

export function setClassDecoratorMetadata<TOptions = unknown>(
  decorator: Fn,
  kind: 'options',
  context: ClassDecoratorContext,
  value: TOptions,
  orThrow?: boolean,
): boolean;
export function setClassDecoratorMetadata<TOptions = unknown>(
  decorator: Fn,
  kind: 'handler',
  context: ClassMethodDecoratorContext,
  value: TOptions,
  orThrow?: boolean,
): boolean;
export function setClassDecoratorMetadata<TOptions = unknown>(
  decorator: Fn,
  kind: 'prop',
  context:
    | ClassDecoratorContext
    | ClassFieldDecoratorContext
    | ClassMethodDecoratorContext,
  value: TOptions,
  orThrow?: boolean,
): boolean;
export function setClassDecoratorMetadata<TOptions = unknown>(
  decorator: Fn,
  kind: ClassMetadataKind,
  context:
    | ClassDecoratorContext
    | ClassFieldDecoratorContext
    | ClassMethodDecoratorContext,
  options: TOptions,
  orThrow = true,
): boolean {
  context.metadata[CLASS_METADATA_KEY] ??= {};

  const metadata = context.metadata[CLASS_METADATA_KEY] as ClassMetadata;

  switch (kind) {
    case 'options':
      if (metadata.options?.has(decorator) || context.kind !== 'class') {
        return orThrow
          ? ConfigurationException.throw`@${decorator} decorator can only be used once`
          : false;
      }

      metadata.options ??= new Map();
      metadata.options.set(decorator, options);
      return true;

    case 'handler':
      if (metadata.handlers?.has(decorator) || context.kind !== 'method') {
        return orThrow
          ? ConfigurationException.throw`@${decorator} decorator can only be used once`
          : false;
      }

      metadata.handlers ??= new Map();
      metadata.handlers.set(decorator, {
        propKey: context.name,
        options,
      });
      return true;

    case 'prop':
      metadata.props ??= new Map();
      metadata.props
        .getOrInsertComputed(decorator, () => [])
        .push(
          context.kind === 'class'
            ? {
                propKind: 'class',
                options,
              }
            : {
                propKind: context.kind,
                propKey: context.name,
                options,
              },
        );
      return true;
  }
}
