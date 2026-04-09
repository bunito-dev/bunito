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

  setContext(contextLike: string | Class | Fn): void {
    if (isFn(contextLike)) {
      this.context = resolveObjectName(contextLike);
      return;
    }

    if (isString(contextLike, true)) {
      this.context = contextLike;
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

  trace(...args: LogArgs): void {
    this.writeLog({
      level: 'TRACE',
      args,
    });
  }

  track(...args: LogArgs): (...postArgs: unknown[]) => void;
  track(...args: unknown[]): (...postArgs: LogArgs) => void;
  track(...args: unknown[]): (...postArgs: unknown[]) => void {
    const now = Date.now();

    return (...postArgs) => {
      this.writeLog({
        level: 'TRACK',
        args: [...args, ...postArgs] as LogArgs,
        duration: Date.now() - now,
      });
    };
  }

  debug<TArg0>(...args: LogArgs<TArg0>): TArg0 {
    this.writeLog({
      level: 'DEBUG',
      args,
    });

    return args[0];
  }

  verbose(...args: [unknown, ...unknown[]]): void {
    this.writeLog({
      level: 'VERBOSE',
      args,
    });
  }

  protected writeLog(options: WriteLogOptions): void {
    this.loggerService.writeLog({
      context: this.context,
      traceId: this.traceId,
      ...options,
    });
  }
}
