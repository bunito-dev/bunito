import type { LogArgs } from './types';

export interface LoggerInstance<TInstance = unknown> {
  usePrefix(prefix: string): void;

  fatal(...args: LogArgs): void;

  error(...args: LogArgs): void;

  warn(...args: LogArgs): void;

  info(...args: LogArgs): void;

  ok(...args: LogArgs): void;

  verbose(...args: LogArgs): void;

  debug<TArg0>(...args: LogArgs<TArg0>): TArg0;

  track(context?: string): TInstance;
}
