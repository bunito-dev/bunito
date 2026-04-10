import type { ScopeKind } from './types';

export const DEFAULT_SCOPES = {
  MODULE: 'singleton',
  PROVIDER: 'singleton',
  CONTROLLER: 'request',
} as const satisfies Record<string, ScopeKind>;

export const CONTAINER_METADATA_KEYS = {
  MODULE: Symbol('MODULE'),
  CONTROLLER: Symbol('CONTROLLER'),
  PROVIDER: Symbol('PROVIDER'),
  ON_LIFECYCLE: Symbol('ON_LIFECYCLE'),
} as const satisfies Record<string, symbol>;
