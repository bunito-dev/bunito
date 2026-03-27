import type { Fn } from '@bunito/common';
import { addDecoratorMetadata } from '@bunito/common';
import { PROVIDER_HOOK_METADATA_KEYS } from '../../constants';
import type { ProviderHook } from '../../types';

export function createProviderHookDecorator(
  hook: ProviderHook,
): () => <TTarget extends Fn>(
  target: TTarget,
  context: ClassMethodDecoratorContext,
) => TTarget {
  return () => (target, context) => {
    addDecoratorMetadata<PropertyKey>(
      context,
      PROVIDER_HOOK_METADATA_KEYS[hook],
      context.name,
    );

    return target;
  };
}
