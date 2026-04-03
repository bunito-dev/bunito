import { defineConfig } from '../config';
import { logFormatParser, logLevelParser } from './parsers';
import type { LogFormat, LogLevel } from './types';

export const LoggerConfig = defineConfig<{
  level: LogLevel;
  format: LogFormat;
}>('logger', ({ whenCI, getEnv }) => {
  return {
    level: getEnv('LOG_LEVEL', logLevelParser) ?? whenCI('info', 'debug'),
    format: getEnv('LOG_FORMAT', logFormatParser) ?? whenCI('json', 'prettify'),
  };
});
