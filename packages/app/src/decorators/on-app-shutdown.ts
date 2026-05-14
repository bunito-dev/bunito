import type {
  ProviderHandlerDecorator,
  ProviderHandlerDecoratorOptions,
} from '@bunito/container';
import { createProviderHandlerDecorator } from '@bunito/container';

export function OnAppShutdown(
  options?: ProviderHandlerDecoratorOptions,
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnAppShutdown, options);
}
