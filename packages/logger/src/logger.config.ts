import { defineConfig } from '@bunito/config';
import { LOG_LEVELS } from './constants';
import type { LogFormat, LogLevel } from './types';

export const LoggerConfig = defineConfig<{
  level: LogLevel;
  format: LogFormat;
}>('Logger', ({ isDev, getEnv }) => ({
  level:
    getEnv('LOG_LEVEL', 'toUpperCase', Object.keys(LOG_LEVELS)) ??
    (isDev ? 'DEBUG' : 'INFO'),
  format:
    getEnv('LOG_FORMAT', 'toLowerCase') ?? //
    (isDev ? 'pretty' : 'json'),
}));
