import type { ProviderHook, ProviderScope } from './types';

export const DEFAULT_PROVIDER_SCOPE: ProviderScope = 'singleton';

export const MODULE_METADATA_KEY = Symbol('module');

export const PROVIDER_METADATA_KEY = Symbol('provider');

export const PROVIDER_HOOK_METADATA_KEYS = {
  setup: Symbol('provider.setup'),
  bootstrap: Symbol('provider.bootstrap'),
  destroy: Symbol('provider.destroy'),
} satisfies Record<ProviderHook, symbol>;
