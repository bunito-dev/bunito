import { defineConfig } from '../config';
import { LOG_LEVELS } from './constants';
import type { LogFormat, LogLevelKind } from './types';

export const LoggerConfig = defineConfig<{
  level: LogLevelKind;
  format: LogFormat;
}>('LoggerConfig', ({ isCI, getEnvAs }) => {
  return {
    level:
      getEnvAs('LOG_LEVEL', 'toUpperCase', Object.keys(LOG_LEVELS)) ??
      (isCI ? 'INFO' : 'DEBUG'),
    format: getEnvAs('LOG_FORMAT', 'toLowerCase') ?? (isCI ? 'json' : 'prettify'),
  };
});
