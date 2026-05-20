import { feature } from 'bun:bundle';

export * from './app';
export * from './decorators';

if (!feature('RUNTIME_ONLY')) {
  await import('./testing');
}
