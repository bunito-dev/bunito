import { LoggerFormatter } from '../../logger-formatter';
import type { LogRecord } from '../../types';

@LoggerFormatter()
export class JSONFormatter implements LoggerFormatter {
  private static nextId = 1;

  readonly NAME = 'json';

  formatLog(options: LogRecord): string {
    const {
      context,
      requestId,
      level,
      error: err,
      message = err?.message,
      data,
      timestamp,
      duration,
    } = options;

    const record: Record<string, unknown> = {
      id: JSONFormatter.nextId++,
      level: level.value,
      context,
      requestId,
      message,
      error: err
        ? {
            name: err.name,
            stack: err.stack,
          }
        : undefined,
      data,
      timestamp,
      duration,
    };

    return JSON.stringify(record);
  }
}
