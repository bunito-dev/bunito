import { ConfigurationException, isFn, isObject, isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Container, OnInit, Provider } from '@bunito/container';
import { LOG_LEVELS, LOGGER_EXTENSION } from './constants';
import { LoggerConfig } from './logger.config';
import type { LoggerExtension } from './logger.extension';
import type { WriteLogOptions } from './types';

@Provider({
  scope: 'singleton',
  injects: [LoggerConfig, Container],
})
export class LoggerService {
  private readonly stdout = process.stdout;

  private extension: LoggerExtension | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    private readonly container: Container,
  ) {
    //
  }

  @OnInit()
  async configure(): Promise<void> {
    const { format } = this.config;

    const definition = this.container
      .getExtensions<string>(LOGGER_EXTENSION)
      .find(({ options }) => options === format);

    if (!definition) {
      return ConfigurationException.throw`Logger format ${format} not supported`;
    }

    const { providerId, moduleId } = definition;

    const extension = await this.container.resolveProvider<LoggerExtension>(providerId, {
      moduleId,
    });

    if (!isObject(extension) || !isFn(extension.formatLog)) {
      return ConfigurationException.throw`${extension} is not a valid LoggerExtension`;
    }

    this.extension = extension;
  }

  writeLog(options: WriteLogOptions): void {
    const { level: name, args, ...formatOptions } = options;
    const value = LOG_LEVELS[name];

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

    const buffer = this.extension?.formatLog({
      level: {
        name,
        value,
      },
      message,
      error,
      data: data.length ? data : undefined,
      timestamp: new Date(),
      ...formatOptions,
    });

    if (!buffer) {
      return;
    }

    this.stdout.write(`${buffer}\n`);
  }
}
