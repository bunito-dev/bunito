import { LoggerExtension } from '../../logger.extension';
import type { FormatLogOptions } from '../../types';

@LoggerExtension('json')
export class JSONExtension implements LoggerExtension {
  private static idCounter = 1;

  static get nextId(): number {
    return JSONExtension.idCounter++;
  }

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
      id: JSONExtension.nextId,
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
