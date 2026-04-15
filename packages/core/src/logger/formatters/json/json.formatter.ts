import { Formatter } from '../formatter.decorator';
import type { FormatterExtension } from '../formatter.extension';
import type { FormatLogOptions } from '../types';

@Formatter('json')
export class JSONFormatter implements FormatterExtension {
  private static idCounter = 1;

  static get nextId(): number {
    return JSONFormatter.idCounter++;
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
      id: JSONFormatter.nextId,
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
