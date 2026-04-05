import type { Class } from '@bunito/common';
import { isClass } from '@bunito/common';
import type { ResolveConfig } from '../config';
import { Provider } from '../container';
import { LOG_FORMATTERS, LOG_LEVELS } from './constants';
import { LoggerConfig } from './logger.config';
import type { LogLevel } from './types';

@Provider({
  scope: 'transient',
  injects: [LoggerConfig],
})
export class Logger {
  private readonly stdout: NodeJS.WriteStream;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    private context?: string,
  ) {
    this.stdout = process.stdout;
  }

  setContext(contextLike: string | Class): void {
    if (isClass(contextLike)) {
      this.context = contextLike.name;
    } else if (typeof contextLike === 'string') {
      this.context = contextLike;
    }
  }

  fatal(message: unknown, ...args: unknown[]): void {
    this.log('fatal', message, ...args);
  }

  error(message: unknown, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  warn<TMessage>(message: TMessage, ...args: unknown[]): TMessage {
    this.log('warn', message, ...args);
    return message;
  }

  info<TMessage>(message: TMessage, ...args: unknown[]): TMessage {
    this.log('info', message, ...args);
    return message;
  }

  ok<TMessage>(message: TMessage, ...args: unknown[]): TMessage {
    this.log('ok', message, ...args);
    return message;
  }

  trace<TMessage>(message: TMessage, ...args: unknown[]): TMessage {
    this.log('trace', message, ...args);
    return message;
  }

  debug<TMessage>(message: TMessage, ...args: unknown[]): TMessage {
    this.log('debug', message, ...args);
    return message;
  }

  verbose<TMessage>(message: TMessage, ...args: unknown[]): TMessage {
    this.log('verbose', message, ...args);
    return message;
  }

  protected log(level: LogLevel, message: unknown, ...args: unknown[]): void {
    if (LOG_LEVELS[this.config.level] > LOG_LEVELS[level]) {
      return;
    }

    const formater = LOG_FORMATTERS[this.config.format];

    if (!formater) {
      return;
    }

    formater(this.stdout, this.context, level, message, args);
  }
}
