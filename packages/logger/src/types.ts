import type { LOG_LEVELS } from './constants';
import type { Logger } from './logger';

export type TraceLogger = Omit<Logger, 'trace' | 'setContext'>;

export type LogLevelName = keyof typeof LOG_LEVELS;

export type LogLevel = {
  name: LogLevelName;
  value: number;
};

export type LogArgs<TArg0 = unknown> = [TArg0, ...unknown[]];

export type LogOptions<TLevel> = {
  context?: string;
  traceId?: number;
  level: TLevel;
  duration?: number;
};

export type WriteLogOptions = LogOptions<LogLevelName> & {
  args: LogArgs;
};
