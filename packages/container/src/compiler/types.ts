import type { Any, Class, Fn, WithBase } from '@bunito/common';
import type { Id, Token, TokenLike } from '../utils';

// modules

export type ModuleId = Id;
export type ModuleLike = Class | ModuleOptions;

export type ModuleOptions = {
  token?: Token;
  imports?: ModuleLike[];
  exports?: TokenLike[];
} & {
  [TKey in keyof Bunito.ModuleProviders]?: Bunito.ModuleProviders[TKey];
};

export type ModuleNode = {
  parents?: Set<ModuleId>;
  children?: Set<ModuleId>;
  providers?: Map<ProviderId, ModuleId>;
  components?: ComponentId[];
  exports?: Set<ProviderId>;
};

// providers

export type ProviderId = Id;
export type ProviderKey = Fn;
export type ProviderScope = 'singleton' | 'module' | 'request' | 'transient';
export type ProviderLike = Class | Fn | ProviderOptions;

export type ProviderClassOptions<
  TInstance = unknown,
  TArgs extends Any[] = Any[],
> = WithInjections<{
  token?: TokenLike;
  scope?: ProviderScope;
  global?: true;
  useClass: Class<TInstance, TArgs>;
}>;

export type ProviderFactoryOptions<
  TResult = unknown,
  TArgs extends Any[] = Any[],
> = WithInjections<{
  token?: TokenLike;
  scope?: ProviderScope;
  global?: true;
  useFactory: Fn<TResult, TArgs>;
}>;

export type ProviderValueOptions<TValue = unknown> = {
  token: TokenLike;
  global?: true;
  useValue: TValue;
};

export type ProviderOptions =
  | ProviderClassOptions
  | ProviderFactoryOptions
  | ProviderValueOptions;

export type ProviderHandlerKey = Fn;
export type ProviderHandlerOptions = WithInjections<{
  propKey: PropertyKey;
}>;

export type ProviderDefinition = {
  moduleId: ModuleId;
  moduleIds?: Set<ModuleId>;
  options: ProviderOptions;
  handlers?: Map<ProviderHandlerKey, ProviderHandlerOptions>;
};

export type ProviderEntity = {
  providerId: ProviderId;
  moduleId: ModuleId;
};

// injections

export type Injections = InjectionLike[] | Record<string, InjectionLike>;
export type InjectionLike = TokenLike | InjectionOptions;

export type InjectionTokenOptions<TOptions = unknown> = {
  useToken: TokenLike;
  optional?: true;
  options?: TOptions;
};

export type InjectionBuilderOptions<TOptions = unknown> = {
  useBuilder: Fn;
  options?: TOptions;
};

export type InjectionValueOptions = {
  useValue: unknown;
};

export type InjectionOptions =
  | InjectionTokenOptions
  | InjectionBuilderOptions
  | InjectionValueOptions;

export type WithInjections<TValue extends object = object> = {
  injects?: Injections;
} & TValue;

// components

export type ComponentId = Id;
export type ComponentKey = Fn;
export type ComponentPropKind = 'class' | 'field' | 'method';
export type ComponentPropSchema = Partial<Record<ComponentPropKind, unknown>>;

export type ComponentPropOptions<
  TOptions extends ComponentPropSchema = ComponentPropSchema,
> =
  | {
      propKind: 'class';
      value: TOptions['class'];
    }
  | {
      propKind: 'field';
      propKey: PropertyKey;
      value: TOptions['field'];
    }
  | {
      propKind: 'method';
      propKey: PropertyKey;
      value: TOptions['method'];
    };

export type ComponentOptions<
  TOptions = unknown,
  TPropOptions extends ComponentPropSchema = ComponentPropSchema,
> = {
  value?: TOptions;
  props?: ComponentPropOptions<TPropOptions>[];
};

export type ComponentDefinition = WithBase<
  {
    options: Map<ComponentKey, ComponentOptions>;
  },
  { useClass: Class },
  { useProvider: ProviderId }
>;
