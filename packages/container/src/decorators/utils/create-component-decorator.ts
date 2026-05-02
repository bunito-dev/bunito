import type { Fn } from '@bunito/common';
import { isFn, isObject } from '@bunito/common';
import { ContainerException } from '../../container.exception';
import { COMPONENT_METADATA_KEY, PROVIDER_METADATA_KEY } from '../constants';
import type {
  ClassDecorator,
  ClassFieldDecorator,
  ClassMethodDecorator,
  ClassPropDecorator,
  ComponentMetadata,
  ProviderDecoratorOptions,
  ProviderMetadata,
} from '../types';

export function createComponentDecorator<TOptions = unknown>(
  componentDecorator: Fn,
  options?: TOptions,
  providerOptions?: ProviderDecoratorOptions,
): ClassDecorator;
export function createComponentDecorator<
  TDecorator extends
    | ClassDecorator
    | ClassFieldDecorator
    | ClassMethodDecorator
    | ClassPropDecorator = ClassPropDecorator,
  TOptions = unknown,
>(componentDecorator: Fn, options: TOptions, propDecorator?: Fn): TDecorator;
export function createComponentDecorator(
  componentDecorator: Fn,
  options: unknown,
  propDecoratorOrProviderOptions?: Fn | ProviderDecoratorOptions,
): ClassPropDecorator {
  return (target, context) => {
    context.metadata[COMPONENT_METADATA_KEY] ??= new Map();

    const metadata = (
      context.metadata[COMPONENT_METADATA_KEY] as ComponentMetadata
    ).getOrInsertComputed(componentDecorator, () => ({}));

    if (!isFn(propDecoratorOrProviderOptions)) {
      if ('value' in metadata) {
        return ContainerException.throw`@${componentDecorator}() decorator can only be applied once`;
      }

      metadata.value = options;

      if (isObject<ProviderDecoratorOptions>(propDecoratorOrProviderOptions)) {
        context.metadata[PROVIDER_METADATA_KEY] ??= {};

        const providerMetadata = context.metadata[
          PROVIDER_METADATA_KEY
        ] as ProviderMetadata;

        if (providerMetadata.options) {
          return ContainerException.throw`@${componentDecorator}() decorator conflicts with @${providerMetadata.decorator ?? 'Provider'}() decorator`;
        }

        providerMetadata.decorator = componentDecorator;
        providerMetadata.options = propDecoratorOrProviderOptions;
      }
    } else {
      metadata.props ??= [];
      metadata.props.push(
        context.kind === 'class'
          ? {
              propKind: 'class',
              value: options,
            }
          : {
              propKind: context.kind,
              propKey: context.name,
              value: options,
            },
      );
    }

    return target;
  };
}
