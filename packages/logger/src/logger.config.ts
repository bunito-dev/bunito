import { ConfigException, defineConfig } from '@bunito/config';
import { LOG_LEVELS } from './constants';
import type { LogLevelName } from './types';

export const LoggerConfig = defineConfig(function Logger({ whenDev, getEnv }) {
  return {
    level:
      getEnv('LOG_LEVEL', 'uppercase', (value: string): LogLevelName => {
        const level = value as LogLevelName;

        if (!LOG_LEVELS[level]) {
          throw new ConfigException(`Invalid log level: ${level}`);
        }

        return level;
      }) ?? whenDev('DEBUG', 'INFO'),
    format: getEnv('LOG_FORMAT', 'lowercase') ?? whenDev('pretty', 'json'),
  };
});
