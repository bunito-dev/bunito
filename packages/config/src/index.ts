import { feature } from 'bun:bundle';
import './globals';

export * from './config-module';
export * from './config-reader';
export * from './config-service';
export * from './types';
export * from './utils';

if (feature('TEST_ONLY')) {
  await import('./testing');
}
