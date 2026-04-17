import type { LOG_LEVELS } from './constants';
import type { Logger } from './logger';

export type LogLevel = keyof typeof LOG_LEVELS;

export type LogFormat = 'json' | 'pretty' | (string & {});

export type LogLevelOptions = {
  name: LogLevel;
  value: number;
};

export type LogArgs<TArg0 = unknown> = [TArg0, ...unknown[]];

export type LogOptions<TLevel> = {
  context?: string;
  traceId?: number;
  level: TLevel;
  duration?: number;
};

export type LogTrace = Omit<Logger, 'trace' | 'setContext'>;

export type WriteLogOptions = LogOptions<LogLevel> & {
  args: LogArgs;
};
