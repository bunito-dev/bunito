import type { ContextId } from '@bunito/container';
import { CONTEXT_ID, Provider } from '@bunito/container';
import { LoggerService } from './logger.service';
import type { LoggerInstance } from './logger-instance';
import type { LogArg, LogArgs, LoggerState, LogLevelKind } from './types';

@Provider({
  scope: 'transient',
  global: true,
  injects: [null, LoggerService, CONTEXT_ID],
})
export class Logger implements LoggerInstance<Logger> {
  constructor(
    private readonly state: LoggerState = {},
    private readonly loggerService: LoggerService,
    contextId: ContextId | null = null,
  ) {
    if (contextId) {
      state.context = contextId.name;
    }
  }

  usePrefix(prefix?: string): this {
    this.state.prefix = prefix;
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

  clone(): Logger {
    return new Logger(
      {
        ...this.state,
      },
      this.loggerService,
    );
  }

  track(): Logger {
    const { context, prefix } = this.state;

    return new Logger(
      {
        context,
        prefix,
        timestamp: new Date(),
      },
      this.loggerService,
    );
  }

  private writeLog(kind: LogLevelKind, args: LogArg[]): void {
    this.loggerService.processLog({
      ...this.state,
      kind,
      args,
    });
  }
}
