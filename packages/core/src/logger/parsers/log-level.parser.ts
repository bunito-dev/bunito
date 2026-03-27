import { LOG_LEVELS } from '../constants';
import type { LogLevel } from '../types';

export function logLevelParser(level: string): LogLevel | undefined {
  const parsed = level.toLowerCase();

  if (parsed in LOG_LEVELS) {
    return parsed as LogLevel;
  }
}
