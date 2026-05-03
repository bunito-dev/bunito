import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';

export interface Middleware<TOptions = unknown> {
  useOptions(): Middleware<TOptions>;
}

export function Middleware<TOptions>(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<Middleware<TOptions>> {
  return createExtensionDecorator(Middleware, options);
}
