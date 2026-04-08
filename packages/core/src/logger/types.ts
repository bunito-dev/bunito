import type { LOG_LEVELS } from './constants';

export type LogLevelKind = keyof typeof LOG_LEVELS;

export type LogLevel = {
  kind: LogLevelKind;
  value: number;
};

export type LogFormat = 'json' | 'prettify' | (string & {});

export type LogArgs<TArg0 = unknown> = [TArg0, ...unknown[]];

export type LogOptions<TLevel> = {
  context?: string;
  traceId?: number;
  level: TLevel;
  duration?: number;
};

export type WriteLogOptions = LogOptions<LogLevelKind> & {
  args: LogArgs;
};

export type FormatLogOptions = LogOptions<LogLevel> & {
  error?: Error;
  message?: string;
  data?: unknown[];
  timestamp: string;
};
