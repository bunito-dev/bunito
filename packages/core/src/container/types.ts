import type { Class, Fn } from '@bunito/common';
import type { ConfigFactoryOptions } from '../config';
import type { Id } from './id';

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

// providers

export type ProviderId = Id;

export type ProviderScope = 'singleton' | 'module' | 'request' | 'transient';

export type ProviderEvent = 'onInit' | 'onResolve' | 'onBoot' | 'onDestroy';

export type ProviderEvents = Partial<Record<ProviderEvent, PropertyKey>>;

export type ProviderDecoratorOptions = Omit<ProviderClassOptions, 'useClass'>;

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

export type ProviderValueOptions = {
  token: Token;
  global?: true;
  scope?: null;
  useValue: unknown;
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

export type ExtensionDecoratorOptions<
  TOmit extends keyof ProviderDecoratorOptions = never,
> = Omit<ProviderDecoratorOptions, 'token' | TOmit>;

// components

export type ComponentKey = symbol;

export type ComponentProp<TOptions = unknown> = {
  propKey: PropertyKey;
  options: TOptions;
};

export type ComponentDefinition<
  TOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> = {
  parentModuleIds: Set<ModuleId>;
  moduleId: ModuleId;
  providerId: ProviderId;
  options?: TOptions[];
  fields?: ComponentProp<TFieldOptions>[];
  methods?: ComponentProp<TMethodOptions>[];
};

export type ComponentPartialDefinition = Omit<
  ComponentDefinition,
  'moduleId' | 'parentModuleIds'
>;

export type ComponentDecoratorOptions<
  TOmit extends keyof ProviderDecoratorOptions = never,
> = Omit<ProviderDecoratorOptions, 'global' | 'token' | TOmit>;

// modules

export type ModuleId = Id;

export type ModuleDecoratorOptions = ModuleOptions &
  Omit<ProviderDecoratorOptions, 'token'>;

export type ModuleOptions = {
  imports?: ModuleOptionsLike[];
  configs?: ConfigFactoryOptions<unknown>[];
  providers?: ProviderOptionsLike[];
  exports?: Array<Token | ProviderOptions>;
} & Partial<Record<keyof Bonito.ModuleComponents, Class[]>>;

export type ModuleOptionsLike = Class | ModuleOptions;

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
    definitions?: Map<ComponentKey, ComponentPartialDefinition[]>;
  };
};
