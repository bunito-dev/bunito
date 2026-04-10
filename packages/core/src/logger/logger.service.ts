import type { Class } from '@bunito/common';
import { isString } from '@bunito/common';
import type { ResolveConfig } from '../config';
import { ConfigService } from '../config';
import { OnInit, Provider } from '../container';
import { LOG_LEVELS } from './constants';
import type { LogFormatter } from './decorators';
import { LoggerConfig } from './logger.config';
import type { WriteLogOptions } from './types';

@Provider({
  scope: 'singleton',
  injects: [LoggerConfig, ConfigService],
})
export class LoggerService {
  private static readonly formatters = new Map<string, Class<LogFormatter>>();

  static registerFormatter(format: string, formatter: Class<LogFormatter>): void {
    LoggerService.formatters.set(format, formatter);
  }

  private readonly stdout = process.stdout;

  private readonly formatter: LogFormatter | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    private readonly configService: ConfigService,
  ) {
    const { format } = config;

    const Formatter = LoggerService.formatters.get(format);

    if (!Formatter) {
      return;
    }

    this.formatter = new Formatter(process.stdout);
  }

  @OnInit()
  configureFormatter(): void {
    this.formatter?.configure?.(this.configService);
  }

  writeLog(options: WriteLogOptions): void {
    const { level: kind, args, ...formatOptions } = options;
    const value = LOG_LEVELS[kind];

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
        kind,
        value,
      },
      message,
      error,
      data: data.length ? data : undefined,
      timestamp: new Date().toISOString(),
      ...formatOptions,
    });

    if (!buffer) {
      return;
    }

    this.stdout.write(`${buffer}\n`);
  }
}
