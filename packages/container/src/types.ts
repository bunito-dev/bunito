import type { Class, Fn } from '@bunito/common';
import type { Id } from './id';

declare global {
  namespace Bunito {
    interface ModuleOptionalProviders {
      extensions: import('@bunito/common').Class[];
    }
  }
}

export type Token<TValue = unknown> =
  | string
  | symbol
  | object
  | Class<TValue>
  | Fn<TValue>;

export type ResolveToken<TToken> =
  TToken extends Class<infer TInstance>
    ? TInstance
    : TToken extends Fn<infer TResult>
      ? TResult
      : never;

export type RequestId = Id;

export type ScopeId = Id;

export type InjectionOptions =
  | {
      token: Token;
      optional: true;
    }
  | {
      token: Token;
      defaultValue: unknown;
    };

export type InjectionOptionsLike = Token | InjectionOptions;

export type InjectionDefinition = {
  providerId: ProviderId;
  defaultValue: unknown;
};

export type ClassPropDefinition<TFieldOptions = unknown, TMethodOptions = unknown> =
  | { kind: 'field'; propKey: PropertyKey; options: TFieldOptions }
  | { kind: 'method'; propKey: PropertyKey; options: TMethodOptions };

// providers

export type ProviderId = Id;

export type ProviderScope = 'singleton' | 'module' | 'request' | 'transient';

export type ProviderEventName =
  | 'OnBoot'
  | 'OnInit'
  | 'OnResolve'
  | 'OnDestroy'
  | (string & {});

export type ProviderEventOptions = {
  propKey: PropertyKey;
  disposable: boolean;
};

export type ProviderEvents = Partial<Record<ProviderEventName, ProviderEventOptions>>;

export type ProviderClassOptions<
  TClass extends Class = Class,
  TInjection = InjectionOptionsLike,
> = {
  token?: Token;
  global?: true;
  scope?: ProviderScope;
  useClass: TClass;
  injects?: TInjection[];
};

export type ProviderFactoryOptions<
  TFactory extends Fn = Fn,
  TInjection = InjectionOptionsLike,
> = {
  token?: Token;
  global?: true;
  scope?: ProviderScope;
  useFactory: TFactory;
  injects?: TInjection[];
};

export type ProviderValueOptions<TValue = unknown> = {
  token: Token;
  global?: true;
  scope?: null;
  useValue: TValue;
  injects?: null;
};

export type ProviderOptions =
  | ProviderClassOptions
  | ProviderFactoryOptions
  | ProviderValueOptions;

export type ProviderOptionsLike = Fn | Class | ProviderOptions;

export type ProviderBaseDefinition<TOptions extends ProviderOptions> = Required<
  Omit<TOptions, 'token' | 'global'>
> & {
  events?: ProviderEvents;
};

export type ProviderClassDefinition = ProviderBaseDefinition<
  ProviderClassOptions<Class, InjectionDefinition>
>;

export type ProviderFactoryDefinition = ProviderBaseDefinition<
  ProviderFactoryOptions<Fn, InjectionDefinition>
>;

export type ProviderValueDefinition = ProviderBaseDefinition<ProviderValueOptions>;

export type ProviderDefinition =
  | ProviderClassDefinition
  | ProviderFactoryDefinition
  | ProviderValueDefinition;

export type ProviderInstanceOptions = {
  scopeId?: ScopeId;
  onResolve?: Fn<Promise<void>>;
  onDestroy?: Fn<Promise<void>>;
};

export type ProviderInstanceDefinition = Omit<ProviderInstanceOptions, 'scopeId'> & {
  instance: unknown;
};

export type ResolveProviderOptions = {
  moduleId?: ModuleId;
  requestId?: RequestId;
};

// extensions

export type ExtensionKey = symbol;

export type ExtensionDefinition<TOptions = unknown> = {
  moduleId: ModuleId;
  providerId: ProviderId;
  options: TOptions;
};

// components

export type ComponentKey = symbol;

export type ComponentBaseDefinition<
  TOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> = {
  moduleId: ModuleId;
  options: TOptions[];
  props: ClassPropDefinition<TFieldOptions, TMethodOptions>[];
};

export type ComponentClassDefinition<
  TOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> = ComponentBaseDefinition<TOptions, TFieldOptions, TMethodOptions> & {
  useClass: Class;
};

export type ComponentProviderDefinition<
  TOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> = ComponentBaseDefinition<TOptions, TFieldOptions, TMethodOptions> & {
  useProviderId: ProviderId;
};

export type ComponentDefinition<
  TOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> =
  | ComponentClassDefinition<TOptions, TFieldOptions, TMethodOptions>
  | ComponentProviderDefinition<TOptions, TFieldOptions, TMethodOptions>;

// modules

export type ModuleId = Id;

export type ModuleOptions = {
  imports?: ModuleOptionsLike[];
  providers?: ProviderOptionsLike[];
  exports?: Array<Token | ProviderOptions>;
} & Partial<Bunito.ModuleOptionalProviders>;

export type ModuleOptionsLike = Class | ModuleOptions;

export type ModuleComponentDefinition = Omit<ComponentDefinition, 'moduleId'>;

export type ModuleDefinition = {
  parents: Set<ModuleId>;
  children: Set<ModuleId>;
  providers: {
    available: Map<ProviderId, ModuleId>;
    definitions: Map<ProviderId, ProviderDefinition>;
    exported: Set<ProviderId>;
  };
  components: {
    options?: Map<ComponentKey, unknown[]>;
    definitions: Map<ComponentKey, ModuleComponentDefinition[]>;
  };
};
