import { LogFormatter } from '../log-formatter';
import type { FormatLogOptions } from '../types';

@LogFormatter()
export class JSONLogFormatter implements LogFormatter {
  private static nextId = 1;

  readonly logFormat = 'json';

  formatLog(options: FormatLogOptions): string {
    const {
      context,
      traceId,
      level,
      error: err,
      message = err?.message,
      data,
      timestamp,
      duration,
    } = options;

    const record: Record<string, unknown> = {
      id: JSONLogFormatter.nextId++,
      level: level.value,
      context,
      traceId,
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
