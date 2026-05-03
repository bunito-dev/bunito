import type {
  ProviderHandlerDecorator,
  ProviderHandlerDecoratorOptions,
} from '@bunito/container/internals';
import { createProviderHandlerDecorator } from '@bunito/container/internals';

export function OnAppShutdown(
  options: ProviderHandlerDecoratorOptions = {},
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnAppShutdown, options);
}
