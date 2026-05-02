import { defineConfig } from '@bunito/config';
import { LOG_LEVELS } from './constants';
import type { LogLevelName } from './types';

export const LoggerConfig = defineConfig<{
  level: LogLevelName;
  format: string;
}>('Logger', ({ getFlag, getEnv }) => {
  let format = getEnv('LOG_FORMAT', 'lowercase');
  let level = getEnv('LOG_LEVEL', 'uppercase') as LogLevelName | undefined;

  if (!format) {
    format = getFlag('dev') ? 'pretty' : 'json';
  }

  if (!level || LOG_LEVELS[level] === undefined) {
    level = getFlag('dev') ? 'DEBUG' : 'INFO';
  }

  return {
    level,
    format,
  };
});
