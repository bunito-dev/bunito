import type { Mandatory } from '@bunito/common';
import type { LOG_LEVELS } from './constants';

export type LoggerState = {
  prefix?: string;
  context?: string;
  timestamp?: Date;
};

export type LogLevelKind = keyof typeof LOG_LEVELS;
export type LogLevel = {
  kind: LogLevelKind;
  value: number;
};

export type LogArg = { context: string | string[] } | { exitCode: number } | unknown;
export type LogArgs<TArg0 = LogArg> = [TArg0, ...LogArg[]];

export type LogOptions = LoggerState & {
  kind: LogLevelKind;
  args: LogArg[];
};

export type LogRecord = Mandatory<LoggerState, 'timestamp'> & {
  level: LogLevel;
  requestId?: number;
  message?: string;
  data?: unknown[];
  error?: Error;
  duration?: number;
  timestamp: Date;
};
