import type { Class, Fn } from '@bunito/common';
import { isFn, isString, resolveObjectName } from '@bunito/common';
import type { RequestId } from '../container';
import { Provider, REQUEST_ID } from '../container';
import { LoggerService } from './logger.service';
import type { LogArgs, WriteLogOptions } from './types';

@Provider({
  scope: 'request',
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

  setContext(contextLike: string | Class | Fn, description?: string): void {
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
      level: 'ERROR',
      args,
    });
  }

  error(...args: LogArgs): void {
    this.writeLog({
      level: 'FATAL',
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

  trace(): Omit<Logger, 'trace' | 'setContext'> {
    const now = Date.now();

    const writeLog = (options: WriteLogOptions) => {
      this.writeLog({
        duration: Date.now() - now,
        ...options,
      });
    };

    return {
      fatal: (...args) => writeLog({ level: 'FATAL', args }),
      error: (...args) => writeLog({ level: 'ERROR', args }),
      warn: (...args) => writeLog({ level: 'WARN', args }),
      info: (...args) => writeLog({ level: 'INFO', args }),
      ok: (...args) => writeLog({ level: 'OK', args }),
      verbose: (...args) => writeLog({ level: 'VERBOSE', args }),
      debug: (...args) => {
        writeLog({ level: 'DEBUG', args });
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
