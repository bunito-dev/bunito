import { InternalException, isObject, isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { RequestIdGetter } from '@bunito/container';
import { Provider, REQUEST_ID_GETTER } from '@bunito/container';
import { LOG_LEVELS } from './constants';
import { LoggerConfig } from './logger-config';
import { LoggerFormatter } from './logger-formatter';
import type { WriteLogOptions } from './types';
import { resolveContext } from './utils';

@Provider({
  scope: 'singleton',
  injects: [LoggerConfig, REQUEST_ID_GETTER, LoggerFormatter],
})
export class LoggerService {
  private readonly stdout = process.stdout;

  private readonly formatter: LoggerFormatter | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    private readonly requestIdGetter: RequestIdGetter,
    formatters: LoggerFormatter[],
  ) {
    const { format } = config;

    for (const formatter of formatters) {
      if (formatter.NAME === format) {
        this.formatter = formatter;
      }
    }

    if (!this.formatter) {
      InternalException.throw`Logger format ${format} is not supported`;
    }
  }

  writeLog(options: WriteLogOptions): void {
    const { kind, args, timestamp } = options;

    const value = LOG_LEVELS[kind];

    if (LOG_LEVELS[this.config.level] > value) {
      return;
    }

    const data: unknown[] = [];

    let { context } = options;
    let error: Error | undefined;
    let message: string | undefined;

    for (const arg of args) {
      if (isObject(arg) && 'context' in arg && Object.keys(arg).length === 1) {
        context = resolveContext([context, arg.context]);
        continue;
      }

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
      context,
      requestId: this.requestIdGetter(),
      level: {
        kind,
        value,
      },
      message,
      error,
      data: data.length ? data : undefined,
      duration: timestamp ? Date.now() - timestamp.getTime() : undefined,
      timestamp: new Date(),
    });

    if (!buffer) {
      return;
    }

    this.stdout.write(`${buffer}\n`);
  }
}
