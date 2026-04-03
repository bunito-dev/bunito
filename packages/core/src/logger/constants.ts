import { jsonFormatter, prettifyFormatter } from './formatters';
import type { LogFormatter } from './types';

export const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  ok: 30,
  trace: 20,
  debug: 10,
  verbose: 0,
} as const;

export const BUILD_IN_LOG_FORMATTERS = {
  none: undefined,
  prettify: prettifyFormatter,
  json: jsonFormatter,
} as const;

export const LOG_FORMATTERS: Record<string, LogFormatter | undefined> = {
  ...BUILD_IN_LOG_FORMATTERS,
};
