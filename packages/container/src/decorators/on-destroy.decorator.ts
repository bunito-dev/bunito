import type { ProviderHandlerDecorator, ProviderHandlerDecoratorOptions } from './types';
import { createProviderHandlerDecorator } from './utils';

export function OnDestroy(
  options: ProviderHandlerDecoratorOptions = {},
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnDestroy, options);
}
