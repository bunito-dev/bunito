import { InternalException } from '@bunito/common';
import { defineConfig } from '@bunito/config';
import { LOG_LEVELS } from './constants';
import type { LogLevelKind } from './types';

export const LoggerConfig = defineConfig<{
  level: LogLevelKind;
  transport: string;
  exitOnFatal: boolean;
}>(function Logger({ whenProd, getEnv }) {
  return {
    level:
      getEnv?.('LOG_LEVEL', 'uppercase', (value: string): LogLevelKind => {
        const level = value as LogLevelKind;

        if (!LOG_LEVELS[level]) {
          throw new InternalException(`Invalid log level: ${level}`);
        }

        return level;
      }) ??
      this.whenProd?.('INFO') ??
      'DEBUG',
    transport: getEnv?.('LOG_TRANSPORT', 'lowercase') ?? whenProd?.('json') ?? 'pretty',
    exitOnFatal: getEnv?.('EXIT_ON_FATAL', 'boolean') ?? true,
  };
});
