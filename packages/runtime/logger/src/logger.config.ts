import { defineConfig } from '@bunito/config';
import { LOG_LEVELS } from './constants';
import type { LogFormat, LogLevel } from './types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
      LOG_COLORS?: string;
      LOG_INSPECT_DEPTH?: string;
    }
  }
}

export const LoggerConfig = defineConfig<{
  level: LogLevel;
  format: LogFormat;
}>('Logger', ({ isCI, getEnv }) => ({
  level:
    getEnv('LOG_LEVEL', 'toUpperCase', Object.keys(LOG_LEVELS)) ??
    (isCI ? 'INFO' : 'DEBUG'),
  format:
    getEnv('LOG_FORMAT', 'toLowerCase') ?? //
    (isCI ? 'json' : 'pretty'),
}));
