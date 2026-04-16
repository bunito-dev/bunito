import type { LogLevelOptions, LogOptions } from '../types';

export type FormatLogOptions = LogOptions<LogLevelOptions> & {
  error?: Error;
  message?: string;
  data?: unknown[];
  timestamp: string;
};
