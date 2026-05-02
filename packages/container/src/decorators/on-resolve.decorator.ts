import type { ProviderHandlerDecorator, ProviderHandlerDecoratorOptions } from './types';
import { createProviderHandlerDecorator } from './utils';

export function OnResolve(
  options: ProviderHandlerDecoratorOptions = {},
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnResolve, options);
}
