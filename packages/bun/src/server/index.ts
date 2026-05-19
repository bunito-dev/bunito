import { feature } from 'bun:bundle';
import './globals';

export * from './constants';
export * from './server-module';
export * from './server-router';
export * from './server-service';
export * from './types';

if (feature('TEST_ONLY')) {
  await import('./testing');
}
