import { isFn, isString, resolveObjectName } from '@bunito/common';
import type { RequestId } from '@bunito/container';
import { Provider, REQUEST_ID } from '@bunito/container';
import { LoggerService } from './logger.service';
import type { LogArgs, LogLevel, LogTrace, WriteLogOptions } from './types';

@Provider({
  scope: 'request',
  global: true,
  injects: [
    LoggerService,
    {
      optional: true,
      token: REQUEST_ID,
    },
  ],
})
export class Logger {
  private context: string | undefined;

  private readonly traceId: number | undefined;

  constructor(
    private readonly loggerService: LoggerService,
    requestId: RequestId | null = null,
  ) {
    this.traceId = requestId?.index;
  }

  setContext(contextLike: string | { name: string }, description?: string): void {
    let context: string | undefined;

    if (isFn(contextLike)) {
      context = resolveObjectName(contextLike);
    } else if (isString(contextLike, true)) {
      context = contextLike;
    }

    if (context) {
      this.context = description ? `${context}(${description})` : context;
    }
  }

  fatal(...args: LogArgs): void {
    this.writeLog({
      level: 'FATAL',
      args,
    });
  }

  error(...args: LogArgs): void {
    this.writeLog({
      level: 'ERROR',
      args,
    });
  }

  warn(...args: LogArgs): void {
    this.writeLog({
      level: 'WARN',
      args,
    });
  }

  info(...args: LogArgs): void {
    this.writeLog({
      level: 'INFO',
      args,
    });
  }

  ok(...args: LogArgs): void {
    this.writeLog({
      level: 'OK',
      args,
    });
  }

  verbose(...args: LogArgs): void {
    this.writeLog({
      level: 'VERBOSE',
      args,
    });
  }

  debug<TArg0>(...args: LogArgs<TArg0>): TArg0 {
    this.writeLog({
      level: 'DEBUG',
      args,
    });

    return args[0];
  }

  trace(): LogTrace {
    const now = Date.now();

    const writeLogWithDuration = (level: LogLevel, args: LogArgs) => {
      this.writeLog({
        level,
        args,
        duration: Date.now() - now,
      });
    };

    return {
      fatal: (...args) => writeLogWithDuration('FATAL', args),
      error: (...args) => writeLogWithDuration('ERROR', args),
      warn: (...args) => writeLogWithDuration('WARN', args),
      info: (...args) => writeLogWithDuration('INFO', args),
      ok: (...args) => writeLogWithDuration('OK', args),
      verbose: (...args) => writeLogWithDuration('VERBOSE', args),
      debug: (...args) => {
        writeLogWithDuration('DEBUG', args);
        return args[0];
      },
    };
  }

  protected writeLog(options: WriteLogOptions): void {
    this.loggerService.writeLog({
      context: this.context,
      traceId: this.traceId,
      ...options,
    });
  }
}
