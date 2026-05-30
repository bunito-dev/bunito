import { feature } from 'bun:bundle';

export * from './app';
export * from './decorators';
export * from './types';

if (!feature('RUNTIME_ONLY')) {
  await import('./testing');
}
