import type { Fn, MaybePromise } from '@bunito/common';
import type { ModuleId } from '../compiler';
import type { Id, TokenLike } from '../utils';

export type ScopeId = Id;
export type RequestId = Id;

export type InstanceDefinition = {
  instance: unknown;
  onResolve?: Fn<Promise<void>>;
  onDestroy?: Fn<Promise<void>>;
};

export type InjectionResolver = (token: TokenLike, options?: unknown) => MaybePromise;

export type GetInstanceOptions = {
  scopeId?: ScopeId;
};

export type SetInstanceInstanceOptions = GetInstanceOptions &
  Omit<InstanceDefinition, 'instance'>;

export type ResolveProviderOptions = {
  requestId?: RequestId;
  moduleId?: ModuleId;
  providerOptions?: unknown;
  injectionResolver?: InjectionResolver;
};
