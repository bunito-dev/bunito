import { feature } from 'bun:bundle';

export * from './app';
export * from './decorators';
export * from './types';
export * from './utils';

if (!feature('RUNTIME_ONLY')) {
  await import('./testing');
}
