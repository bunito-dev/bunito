import type { ProviderHandlerDecorator, ProviderHandlerDecoratorOptions } from './types';
import { createProviderHandlerDecorator } from './utils';

export function OnInit(
  options: ProviderHandlerDecoratorOptions = {},
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnInit, options);
}
