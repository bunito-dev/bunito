import type { Any, Class, Fn, MaybePromise, RawObject } from '@bunito/common';
import type { Id } from './id';
import type {
  ClassMetadataKey,
  ClassPropMetadata,
  ClassPropOptionsSchema,
} from './metadata';

declare global {
  namespace Bunito {
    interface ModuleSchemaProviders {
      providers: ProviderLike[];
    }
  }
}

export type Token<TValue = unknown> =
  | string
  | symbol
  | object
  | Fn<TValue>
  | Class<TValue>;

export type TokenLike =
  | Token
  | {
      token: Token;
    };

export type ResolveToken<TToken> =
  TToken extends Class<infer TInstance>
    ? TInstance
    : TToken extends Fn<infer TResult>
      ? TResult
      : never;

export type ScopeId = Id;
export type RequestId = Id;

export type GetProviderInstanceParams = {
  scopeId?: ScopeId;
};

export type SetProviderInstanceParams = GetProviderInstanceParams &
  Omit<ProviderInstance, 'instance'>;

export type ResolveProviderParams = {
  requestId?: RequestId;
  moduleId?: ModuleId;
  providerOptions?: unknown;
  resolveInjection?: (token: TokenLike, options?: unknown) => MaybePromise;
};

// modules

export type ModuleId = Id;
export type ModuleLike = Class | ModuleSchema;

export type ModuleSchema = {
  token?: Token;
  imports?: ModuleLike[];
  exports?: TokenLike[];
} & {
  [TKey in keyof Bunito.ModuleSchemaProviders]?: Bunito.ModuleSchemaProviders[TKey];
};

export type ModuleNode = {
  parents?: Set<ModuleId>;
  children?: Set<ModuleId>;
  providers?: Map<ProviderId, ModuleId>;
  components?: Set<ComponentId>;
  exports?: Set<ProviderId>;
};

// providers

export type ProviderId = Id;
export type ProviderKey = ProviderGroup | ComponentKey;
export type ProviderGroup = symbol;
export type ProviderGroupLike = ProviderGroup | ProviderGroup[];
export type ProviderScope = 'singleton' | 'module' | 'request' | 'transient';

export type ProviderLike = Class | Fn | ProviderSchema;

export type ProviderClassSchema<
  TInstance = unknown,
  TArgs extends Any[] = Any[],
> = WithInjections<{
  scope?: ProviderScope;
  token?: undefined;
  group?: ProviderGroupLike;
  global?: true;
  useClass: Class<TInstance, TArgs>;
}>;

export type ProviderFactorySchema<
  TResult = unknown,
  TArgs extends Any[] = Any[],
> = WithInjections<{
  scope?: ProviderScope;
  token?: TokenLike;
  group?: ProviderGroupLike;
  global?: true;
  useFactory: Fn<TResult, TArgs>;
}>;

export type ProviderValueSchema<TValue = unknown> = {
  scope?: undefined;
  token: TokenLike;
  group?: ProviderGroupLike;
  global?: true;
  useValue: TValue;
};

export type ProviderSchema =
  | ProviderClassSchema
  | ProviderFactorySchema
  | ProviderValueSchema;

export type ProviderHandlerFn = Fn<Promise<void>>;

export type ProviderHandlerSchema = WithInjections<{
  disposable?: true;
}>;

export type ProviderDefinition = {
  moduleId: ModuleId;
  moduleIds?: Set<ModuleId>;
  schema: ProviderSchema;
};

export type ProviderMatch = {
  providerId: ProviderId;
  moduleId: ModuleId;
};

export type ProviderInstance = {
  instance: unknown;
  onResolve?: ProviderHandlerFn;
  onDestroy?: ProviderHandlerFn;
};

// injections

export type InjectionLike = TokenLike | InjectionSchema;

export type InjectionsLike = InjectionLike[] | Record<string, InjectionLike>;

export type InjectionTokenSchema<TOptions = unknown> = {
  useToken: TokenLike;
  optional?: true;
  options?: TOptions;
};

export type InjectionGroupSchema = {
  useGroup: symbol;
};

export type InjectionBuilderSchema<TOptions = unknown> = {
  useBuilder: Fn;
  options?: TOptions;
};

export type InjectionValueSchema = {
  useValue: unknown;
};

export type InjectionSchema =
  | InjectionTokenSchema
  | InjectionGroupSchema
  | InjectionBuilderSchema
  | InjectionValueSchema;

export type WithInjections<TValue extends RawObject = RawObject> = {
  injects?: InjectionsLike;
} & TValue;

// components

export type ComponentId = Id;
export type ComponentKey = ClassMetadataKey;

export type ComponentBase<TProps> =
  | {
      useClass: Class;
      props: TProps;
    }
  | {
      useProvider: ProviderId;
      props: TProps;
    };

export type ComponentGroup = ComponentBase<Map<ComponentKey, ClassPropMetadata[]>>;

export type ComponentNode<
  TOptionsSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
> = ComponentBase<ClassPropMetadata<TOptionsSchema>[]>;

export type ComponentMatchChild<
  TOptionsSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
> = ComponentMatch<TOptionsSchema>;

export type ComponentMatch<
  TOptionsSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
> = {
  moduleId: Id;
  components?: ComponentNode<TOptionsSchema>[];
  children?: ComponentMatchChild<TOptionsSchema>[];
};
