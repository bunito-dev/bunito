import type {
  ProviderHandlerDecorator,
  ProviderHandlerDecoratorOptions,
} from '@bunito/container';
import { createProviderHandlerDecorator } from '@bunito/container';

export function OnAppStart(
  options?: ProviderHandlerDecoratorOptions,
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnAppStart, options);
}
