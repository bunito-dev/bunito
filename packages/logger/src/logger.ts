import { Provider } from '@bunito/container';
import { LoggerService } from './logger-service';
import type { LogArg, LogArgs, LoggerSettings, LogLevelKind } from './types';
import { resolveContext } from './utils';

@Provider({
  scope: 'transient',
  global: true,
  injects: [LoggerService],
})
export class Logger {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly settings: LoggerSettings = {},
  ) {}

  setContext(...contextLike: unknown[]): this {
    this.settings.context = resolveContext(contextLike);

    return this;
  }

  startTracking(): this {
    this.settings.timestamp = new Date();
    return this;
  }

  stopTracking(): this {
    this.settings.timestamp = undefined;
    return this;
  }

  clone(...contextLike: unknown[]): Logger {
    const { context, timestamp } = this.settings;

    return new Logger(this.loggerService, {
      context: resolveContext(contextLike) ?? context,
      timestamp,
    });
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
    const { context } = this.settings;

    return new Logger(this.loggerService, {
      context: resolveContext(contextLike) ?? context,
    }).startTracking();
  }

  protected writeLog(kind: LogLevelKind, args: LogArg[]): void {
    this.loggerService.writeLog({
      ...this.settings,
      kind,
      args,
    });
  }
}
