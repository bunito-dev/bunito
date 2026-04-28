import type {
  ModuleSchema,
  ProviderClassSchema,
  ProviderHandlerSchema,
  ProviderScope,
  WithInjections,
} from '../types';

export type ModuleDecoratorOptions = ModuleSchema &
  WithInjections<{
    scope?: Extract<ProviderScope, 'singleton' | 'module'>;
  }>;

export type ProviderDecoratorOptions = Omit<ProviderClassSchema, 'useClass'>;

export type ProviderHandlerDecoratorOptions = Omit<ProviderHandlerSchema, 'disposable'>;
