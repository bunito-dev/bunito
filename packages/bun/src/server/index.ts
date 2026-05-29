import { feature } from 'bun:bundle';
import './globals';

export * from './bun-server.module';
export * from './bun-server.service';
export * from './bun-server-router';
export * from './constants';
export * from './types';

if (!feature('RUNTIME_ONLY')) {
  await import('./testing');
}
