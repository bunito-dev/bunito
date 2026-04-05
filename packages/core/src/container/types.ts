import type { Class, Fn } from '@bunito/common';
import type { Id } from './id';

export type CallableInstance<TResult = unknown> = Record<
  PropertyKey,
  Fn<Promise<TResult> | TResult>
>;

export type Token<TInner = unknown> =
  | symbol
  | string
  | object
  | Class<TInner>
  | Fn<TInner>;

export type ResolveToken<TToken> =
  TToken extends Class<infer TInstance>
    ? TInstance
    : TToken extends Fn<infer TResult>
      ? TResult
      : never;

export type RequestId = Id;

export type ScopeId = Id;

export type ScopeKind = 'singleton' | 'module' | 'request' | 'transient';

export type ScopedInstance = {
  instance: unknown;
  onResolve: LifecycleHandler | undefined;
  onDestroy: LifecycleHandler | undefined;
};

export type LifecycleEvent = 'onInit' | 'onResolve' | 'onBoot' | 'onDestroy';

export type LifecycleProps = Map<LifecycleEvent, PropertyKey>;

export type LifecycleHandler = () => Promise<void>;

export type LifecycleHandlers = Partial<
  Record<LifecycleEvent, LifecycleHandler | undefined>
>;

export type InjectionLike = Token | InjectionOptions;

export type InjectionOptions = {
  token: Token;
  optional?: true;
};

export type CompiledInjection = {
  providerId: ProviderId;
  optional: boolean;
};

// modules

export type ModuleId = Id;

export type ModuleLike = Class | ModuleOptions;

export type ModuleOptions = {
  imports?: Array<ModuleLike | null>;
  providers?: Array<ProviderLike | null>;
  controllers?: Array<ControllerRef | null>;
  exports?: Array<ProviderLike | null>;
};

export type ClassModuleOptions = ModuleOptions & {
  scope?: ScopeKind;
  injects?: Array<InjectionLike | null>;
};

export type ModuleDefinition = {
  useClass: Class | undefined;
  imports: ModuleLike[];
  providers: ProviderLike[];
  controllers: ControllerRef[];
  exports: ProviderLike[];
};

export type CompiledModule = {
  useClass: Class | undefined;
  imports: Set<ModuleId>;
  providers: Map<ProviderId, CompiledProvider>;
  controllers: Set<ControllerId>;
  exports: Map<ProviderId, ModuleId>;
};

// controllers

export type ControllerId = Id;

export type ControllerRef = Class;

export type ControllerOptions = {
  scope?: ScopeKind;
  injects?: Array<InjectionLike | null>;
};

export type ControllerNode = {
  moduleId: ModuleId;
  parentClasses: Class[];
  useClass: Class;
};

// providers

export type ProviderId = Id;

export type ProviderLike = Token | ProviderOptions;

export type ClassProviderMetadata = Omit<ClassProviderOptions, 'useClass'>;

export type ClassProviderOptions<
  TInstance = unknown,
  TInjection = InjectionLike | null,
> = {
  token?: Token;
  scope?: ScopeKind;
  useClass: Class<TInstance>;
  injects?: TInjection[];
};

export type FactoryProviderOptions<
  TResult = unknown,
  TInjection = InjectionLike | null,
> = {
  token?: Token;
  scope?: ScopeKind;
  useFactory: Fn<TResult>;
  injects?: TInjection[];
};

export type ValueProviderOptions<TValue = unknown> = {
  token: Token;
  useValue: TValue;
};

export type ProviderOptions =
  | ClassProviderOptions
  | FactoryProviderOptions
  | ValueProviderOptions;

export type CompiledClassProvider<TInstance = unknown> = Required<
  Omit<ClassProviderOptions<TInstance, CompiledInjection>, 'token'>
> & {
  kind: 'class';
  lifecycle: LifecycleProps;
};

export type CompiledFactoryProvider<TResult = unknown> = Required<
  Omit<FactoryProviderOptions<TResult, CompiledInjection>, 'token'>
> & {
  kind: 'factory';
};

export type CompiledValueProvider<TValue = unknown> = Required<
  Omit<ValueProviderOptions<TValue>, 'token'>
> & {
  kind: 'value';
};

export type CompiledProvider =
  | CompiledClassProvider
  | CompiledFactoryProvider
  | CompiledValueProvider;

export type ResolveProviderOptions = {
  moduleId: ModuleId;
  requestId?: RequestId;
};

export type ProviderMatch = {
  moduleId: ModuleId;
  provider: CompiledProvider;
};
