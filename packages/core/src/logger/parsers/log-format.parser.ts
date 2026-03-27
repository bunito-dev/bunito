import { LOG_FORMATTERS } from '../constants';
import type { LogFormat } from '../types';

export function logFormatParser(level: string): LogFormat | undefined {
  const parsed = level.toLowerCase();

  return parsed in LOG_FORMATTERS ? parsed : undefined;
}
