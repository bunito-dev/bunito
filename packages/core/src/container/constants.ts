import type { ScopeKind } from './types';

export const DEFAULT_SCOPES = {
  module: 'singleton',
  provider: 'singleton',
  controller: 'request',
} as const satisfies Record<string, ScopeKind>;

export const DECORATOR_METADATA_KEYS = {
  module: Symbol('core(module)'),
  controller: Symbol('core(controller)'),
  provider: Symbol('core(provider)'),
  lifecycle: Symbol('core(lifecycle)'),
} as const satisfies Record<string, symbol>;
