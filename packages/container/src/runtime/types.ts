import type { Fn, MaybePromise } from '@bunito/common';
import type { ModuleId, ProviderId } from '../compiler';
import type { Id, TokenLike } from '../utils';
import type { ProviderStore } from './provider-store';

export type ContextId = Id;

export type InjectionResolver = (token: TokenLike, options?: unknown) => MaybePromise;

export type RequestIdGetter = () => number | undefined;

export type RequestStore = {
  id?: number;
  providers?: ProviderStore;
  state?: RequestState;
};

export type RequestState = WeakMap<symbol | object, unknown>;

export type ResolveProviderOptions = {
  moduleId?: ModuleId;
  context?: TokenLike;
};

export type ResolveInjectionsOptions = ResolveProviderOptions & {
  injectionResolver?: InjectionResolver;
};

export type ResolveProviderRuntimeOptions = {
  moduleId?: ModuleId;
  providerId?: ProviderId;
  contextId?: ContextId;
  injectionResolver?: InjectionResolver;
};

export type ProviderInstance = {
  instance: unknown;
  onResolve?: Fn<Promise<void>>;
  onDestroy?: Fn<Promise<void>>;
};

export type GetProviderInstanceOptions = {
  moduleId?: ModuleId;
};

export type SetProviderInstanceOptions = GetProviderInstanceOptions &
  Omit<ProviderInstance, 'instance'>;
