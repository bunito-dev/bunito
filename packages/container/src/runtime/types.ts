import type { Fn, MaybePromise } from '@bunito/common';
import type { ModuleId } from '../compiler';
import type { TokenLike } from '../utils';
import type { ProviderStore } from './provider-store';

export type InjectionResolver = (token: TokenLike, options?: unknown) => MaybePromise;

export type RequestIdGetter = () => number | undefined;

export type RequestStore = {
  id?: number;
  providers?: ProviderStore;
  state?: Map<unknown, unknown>;
};

export type ResolveProviderOptions = {
  moduleId?: ModuleId;
  providerOptions?: unknown;
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
