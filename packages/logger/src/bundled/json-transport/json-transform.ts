import { LoggerTransport } from '../../logger-transport';
import type { LogRecord } from '../../types';

@LoggerTransport()
export class JSONTransform implements LoggerTransport {
  private static nextTraceId = 1;

  readonly NAME = 'json';

  format(options: LogRecord): Record<string, unknown> {
    const { level, error: err, message = err?.message, ...common } = options;

    const result: Record<string, unknown> = {
      traceId: JSONTransform.nextTraceId++,
      level: level.value,
      ...common,
    };

    if (message) {
      result.message = message;
    }

    if (err) {
      result.err = {
        name: err.name,
        stack: err.stack,
      };
    }

    return result;
  }

  write(options: LogRecord): void {
    console.log(JSON.stringify(this.format(options)));
  }
}
