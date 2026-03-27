import type { Any, Class, Fn } from '@bunito/common';
import type { Id } from './id';

export type Token = symbol | string | object;

export type ResolveToken<TToken> =
  TToken extends Class<infer TInstance>
    ? TInstance
    : TToken extends Fn<infer TResult>
      ? TResult
      : never;

export type DisabledRef = null | undefined;

export type RequestId = Id;

export type ScopeId = Id;

// modules

export type ModuleId = Id;

export type ModuleRef = Class | ModuleOptions;

export type ModuleOptions = Partial<{
  extends: ModuleRef;
  imports: Array<ModuleRef | DisabledRef>;
  providers: Array<ProviderRef | DisabledRef>;
  controllers: Array<ControllerRef | DisabledRef>;
  exports: Array<Token | DisabledRef>;
}>;

export type ModuleOptionsNormalized = {
  entrypointRef: ProviderRef | undefined;
  extends: ModuleRef | undefined;
  imports: Array<ModuleRef>;
  providers: Array<ProviderRef>;
  controllers: Array<ControllerRef>;
  exports: Array<Token>;
};

export type CompiledModule = {
  entrypointId: ProviderId | undefined;
  imports: Set<ModuleId>;
  providers: Map<ProviderId, CompiledProvider>;
  controllers: Set<ControllerId>;
  exports: Map<ProviderId, ModuleId>;
};

export type ModuleNode = {
  moduleId: ModuleId;
  entrypointId: ProviderId;
};

// controllers

export type ControllerId = Id;

export type ControllerRef = Class;

export type ControllerNode = {
  moduleId: ModuleId;
  classStack: Array<Class>;
};

// providers

export type ProviderId = Id;

export type ProviderRef = Class | Fn | AnyProviderOptions;

export type ProviderKind = 'class' | 'factory' | 'value';

export type ProviderHook = 'setup' | 'bootstrap' | 'destroy';

export type ProviderScope = 'singleton' | 'module' | 'request' | 'transient';

export type ProviderInjectionOptions =
  | {
      token: Token;
      optional: true;
    }
  | Token;

export type ProviderInjection = {
  providerId: ProviderId;
  optional: boolean;
};

export type ClassProviderOptions = {
  scope?: ProviderScope;
  token?: Token;
  useClass: Class;
  injects?: Array<ProviderInjectionOptions | null>;
};

export type FactoryProviderOptions<TResult = Any> = {
  scope?: ProviderScope;
  token?: Token;
  useFactory: Fn<TResult>;
  injects?: Array<ProviderInjectionOptions | null>;
};

export type ValueProviderOptions = {
  token: Token;
  useValue: unknown;
};

export type AnyProviderOptions =
  | ClassProviderOptions
  | FactoryProviderOptions
  | ValueProviderOptions;

export type BaseProviderOptionsNormalized<TKind extends ProviderKind> = {
  token: Token;
  kind: TKind;
};

export type ClassProviderOptionsNormalized = BaseProviderOptionsNormalized<'class'> & {
  scope: ProviderScope;
  useClass: Class;
  injects: Array<ProviderInjection>;
};

export type FactoryProviderOptionsNormalized =
  BaseProviderOptionsNormalized<'factory'> & {
    scope: ProviderScope;
    useFactory: Fn;
    injects: Array<ProviderInjection>;
  };

export type ValueProviderOptionsNormalized = BaseProviderOptionsNormalized<'value'> & {
  useValue: unknown;
};

export type ProviderOptionsNormalized =
  | ClassProviderOptionsNormalized
  | FactoryProviderOptionsNormalized
  | ValueProviderOptionsNormalized;

export type CompiledProvider =
  | Omit<ClassProviderOptionsNormalized, 'token'>
  | Omit<FactoryProviderOptionsNormalized, 'token'>
  | Omit<ValueProviderOptionsNormalized, 'token'>;

export type ProviderMatch = {
  moduleId: ModuleId;
  provider: CompiledProvider;
};

export type ProviderInstance<TResult = unknown> = Record<
  PropertyKey,
  Fn<Promise<TResult> | TResult>
>;

export type ResolveProviderOptions = {
  moduleId: ModuleId;
  requestId?: RequestId;
};
