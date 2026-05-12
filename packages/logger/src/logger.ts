import type { RequestId } from '@bunito/container';
import { Provider, REQUEST_ID } from '@bunito/container';
import { LoggerService } from './logger-service';
import type { LogArg, LogArgs, LoggerSettings, LogLevelKind } from './types';
import { resolveContext } from './utils';

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
  constructor(
    private readonly loggerService: LoggerService,
    requestId: RequestId | null = null,
    private readonly settings: LoggerSettings = {},
  ) {
    if (requestId) {
      settings.traceId = requestId.index;
    }
  }

  setContext(...contextLike: unknown[]): this {
    this.settings.context = resolveContext(contextLike);

    return this;
  }

  fatal(...args: LogArgs): void {
    this.writeLog('FATAL', args);
  }

  error(...args: LogArgs): void {
    this.writeLog('ERROR', args);
  }

  warn(...args: LogArgs): void {
    this.writeLog('WARN', args);
  }

  info(...args: LogArgs): void {
    this.writeLog('INFO', args);
  }

  ok(...args: LogArgs): void {
    this.writeLog('OK', args);
  }

  verbose(...args: LogArgs): void {
    this.writeLog('VERBOSE', args);
  }

  debug<TArg0>(...args: LogArgs<TArg0>): TArg0 {
    this.writeLog('DEBUG', args);
    return args[0];
  }

  track(...contextLike: unknown[]): Logger {
    const { context, traceId } = this.settings;

    return new Logger(this.loggerService, null, {
      context: resolveContext(contextLike) ?? context,
      traceId,
      timestamp: new Date(),
    });
  }

  protected writeLog(kind: LogLevelKind, args: LogArg[]): void {
    this.loggerService.writeLog({
      ...this.settings,
      kind,
      args,
    });
  }
}
