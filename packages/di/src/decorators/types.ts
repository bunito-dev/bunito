import type {
  ModuleSchema,
  ProviderClassSchema,
  ProviderHandlerSchema,
  ProviderScope,
} from '../types';

export type ModuleDecoratorOptions = ModuleSchema &
  Omit<ProviderDecoratorOptions, 'token' | 'scope' | 'global'> & {
    scope?: Extract<ProviderScope, 'singleton' | 'module'>;
  };

export type ProviderDecoratorOptions = Omit<ProviderClassSchema, 'useClass'>;

export type ProviderHandlerDecoratorOptions = Omit<ProviderHandlerSchema, 'disposable'>;
