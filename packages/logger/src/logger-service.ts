import * as process from 'node:process';
import { InternalException, isObject, isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { RequestIdGetter } from '@bunito/container';
import { Provider, REQUEST_ID_GETTER } from '@bunito/container';
import { LOG_LEVELS } from './constants';
import { LoggerConfig } from './logger-config';
import { LoggerTransport } from './logger-transport';
import type { LogOptions, LogRecord } from './types';
import { resolveContext } from './utils';

@Provider({
  scope: 'singleton',
  injects: [LoggerConfig, REQUEST_ID_GETTER, LoggerTransport],
})
export class LoggerService {
  private readonly transport: LoggerTransport;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    private readonly requestIdGetter: RequestIdGetter,
    transports: LoggerTransport[],
  ) {
    const transport = transports.find((transport) => transport.NAME === config.transport);

    if (!transport) {
      throw new InternalException(
        `Logger transport "${config.transport}" is not supported`,
      );
    }

    this.transport = transport;
  }

  processLog(options: LogOptions): void {
    const { kind, args, timestamp } = options;

    const value = LOG_LEVELS[kind];

    if (LOG_LEVELS[this.config.level] <= value) {
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

      const record: LogRecord = {
        level: {
          kind,
          value,
        },
        timestamp: new Date(),
      };

      if (context) {
        record.context = context;
      }

      const requestId = this.requestIdGetter();

      if (requestId) {
        record.requestId = requestId;
      }

      if (message) {
        record.message = message;
      }

      if (error) {
        record.error = error;
      }

      if (data.length) {
        record.data = data;
      }

      if (timestamp) {
        record.duration = Date.now() - timestamp.getTime();
      }

      this.transport.write(record);
    }

    if (kind === 'FATAL' && this.config.exitOnFatal) {
      process.exit(1);
    }
  }
}
