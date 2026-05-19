import { feature } from 'bun:bundle';

export * from './app';
export * from './decorators';

if (feature('TEST_ONLY')) {
  await import('./testing');
}
