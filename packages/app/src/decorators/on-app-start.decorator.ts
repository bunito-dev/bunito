import type {
  ProviderHandlerDecorator,
  ProviderHandlerDecoratorOptions,
} from '@bunito/container/internals';
import { createProviderHandlerDecorator } from '@bunito/container/internals';

export function OnAppStart(
  options: ProviderHandlerDecoratorOptions = {},
): ProviderHandlerDecorator {
  return createProviderHandlerDecorator(OnAppStart, options);
}
