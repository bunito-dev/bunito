import type { Any, Class, Fn } from '@bunito/common';
import type { ClassPropMetadata, ControllerClassOptions } from '../decorators';
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
  controllers?: ControllerDefinition[];
  classes?: Class[];
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

// controllers

export type ControllerOptions = {
  prefix?: string;
};

export type ControllerDefinition = {
  providerId: ProviderId;
  classRef: Class;
  options: ControllerOptions;
};

export type ControllerPropOptions = {
  kind: string;
  [key: string]: unknown;
};

export type MatchedControllerProps<TClassOptions, TMethodOptions> = ClassPropMetadata<
  TClassOptions extends ControllerPropOptions
    ? TClassOptions | ControllerClassOptions
    : ControllerClassOptions,
  unknown,
  TMethodOptions
>[];

export type MatchedController<TClassOptions, TMethodOptions> = {
  providerId: ProviderId;
  options: ControllerOptions;
  props: MatchedControllerProps<TClassOptions, TMethodOptions>;
};

export type MatchedControllers<TClassOptions = unknown, TMethodOptions = unknown> = {
  moduleId: ModuleId;
  props?: MatchedControllerProps<TClassOptions, TMethodOptions>;
  controllers?: MatchedController<TClassOptions, TMethodOptions>[];
  children?: MatchedControllers<TClassOptions, TMethodOptions>[];
};
