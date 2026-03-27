import type { BUILD_IN_LOG_FORMATTERS, LOG_LEVELS } from './constants';

export type LogLevel = keyof typeof LOG_LEVELS;

export type LogFormat = keyof typeof BUILD_IN_LOG_FORMATTERS | (string & {});

export type LogFormatter = (
  stdout: NodeJS.WriteStream,
  context: string | undefined,
  level: LogLevel,
  message: unknown,
  args: Array<unknown>,
) => void;
