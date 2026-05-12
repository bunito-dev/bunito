import './globals';

export type {
  Injections,
  ModuleId,
  ModuleLike,
  ProviderId,
  ProviderLike,
  ProviderScope,
} from './compiler';
export { Container } from './container';
export {
  Controller,
  Module,
  OnDestroy,
  OnInit,
  OnResolve,
  Provider,
  UsePrefix,
} from './decorators';
export type { RequestId } from './runtime';
export {
  MODULE_ID,
  PROVIDER_OPTIONS,
  REQUEST_ID,
} from './runtime';
export type { TokenLike } from './utils';
