import type { ModuleLike } from '@bunito/container';
import type { App } from './app';

export type AppAction = 'start' | 'shutdown';

export type AppEvents = {
  ready: [];
  shutdown: [];
  action: [action: AppAction];
  error: [err: unknown];
};

export type AppFactory = (
  rootModule: ModuleLike,
  ...defaultModules: ModuleLike[]
) => Promise<App>;
