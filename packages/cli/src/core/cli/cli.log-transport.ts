import type { LogRecord } from '@bunito/logger';
import { LogTransport } from '@bunito/logger';

@LogTransport()
export class CLILogTransport implements LogTransport {
  readonly NAME = 'cli';

  write(options: LogRecord): void {
    const { prefix, level, message, error, data } = options;

    console.error(`${prefix ? `${prefix} ` : ''}[${level.kind}]`, message, error, data);
  }
}
