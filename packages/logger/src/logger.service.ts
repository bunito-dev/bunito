import { isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Provider } from '@bunito/container';
import { LOG_LEVELS } from './constants';
import { LogFormatter } from './formatters';
import { LoggerConfig } from './logger.config';
import { LoggerException } from './logger.exception';
import type { WriteLogOptions } from './types';

@Provider({
  scope: 'singleton',
  injects: [LoggerConfig, LogFormatter],
})
export class LoggerService {
  private readonly stdout = process.stdout;

  private readonly formatter: LogFormatter | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    formatters: LogFormatter[],
  ) {
    const { format } = config;

    for (const formatter of formatters) {
      if (formatter.logFormat === format) {
        this.formatter = formatter;
      }
    }

    if (!this.formatter) {
      LoggerException.throw`Logger format ${format} is not supported`;
    }
  }

  writeLog(options: WriteLogOptions): void {
    const { level: name, args, ...formatOptions } = options;
    const value = LOG_LEVELS[name];

    if (LOG_LEVELS[this.config.level] > value) {
      return;
    }

    const data: unknown[] = [];

    let error: Error | undefined;
    let message: string | undefined;

    for (const arg of args) {
      if (!error && Error.isError(arg)) {
        error = arg;
        message ??= arg.message;
        continue;
      }

      if (!message && isString(arg)) {
        message = arg;
        continue;
      }

      data.push(arg);
    }

    const buffer = this.formatter?.formatLog({
      level: {
        name,
        value,
      },
      message,
      error,
      data: data.length ? data : undefined,
      timestamp: new Date(),
      ...formatOptions,
    });

    if (!buffer) {
      return;
    }

    this.stdout.write(`${buffer}\n`);
  }
}
