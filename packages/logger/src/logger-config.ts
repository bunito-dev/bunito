import { InternalException } from '@bunito/common';
import { defineConfig } from '@bunito/config';
import { LOG_LEVELS } from './constants';
import type { LogLevelKind } from './types';

export const LoggerConfig = defineConfig(function Logger({ whenDev, getEnv }) {
  return {
    level:
      getEnv('LOG_LEVEL', 'uppercase', (value: string): LogLevelKind => {
        const level = value as LogLevelKind;

        if (!LOG_LEVELS[level]) {
          throw new InternalException(`Invalid log level: ${level}`);
        }

        return level;
      }) ?? whenDev('DEBUG', 'INFO'),
    format: getEnv('LOG_FORMAT', 'lowercase') ?? whenDev('pretty', 'json'),
  };
});
