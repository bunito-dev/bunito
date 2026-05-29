import { feature } from 'bun:bundle';
import './globals';

export * from './constants';
export * from './log-transport';
export * from './logger';
export * from './logger.module';
export * from './logger.service';
export * from './logger-instance';
export * from './types';

if (!feature('RUNTIME_ONLY')) {
  await import('./testing');
}
