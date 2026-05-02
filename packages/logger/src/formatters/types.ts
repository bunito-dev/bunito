import type { LogLevel, LogOptions } from '../types';

export type FormatLogOptions = LogOptions<LogLevel> & {
  error?: Error;
  message?: string;
  data?: unknown[];
  timestamp: Date;
};
