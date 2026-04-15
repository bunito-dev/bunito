import { isObject, isString, str } from '@bunito/common';
import type { ResolveConfig } from '../config';
import { Container, OnInit, Provider } from '../container';
import { ConfigurationException } from '../exceptions';
import { LOG_LEVELS } from './constants';
import type { FormatterExtension } from './formatters';
import { FORMATTER_EXTENSION } from './formatters';
import { LoggerConfig } from './logger.config';
import type { WriteLogOptions } from './types';

@Provider({
  scope: 'singleton',
  injects: [LoggerConfig, Container],
})
export class LoggerService {
  private readonly stdout = process.stdout;

  private formatter: FormatterExtension | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof LoggerConfig>,
    private readonly container: Container,
  ) {
    //
  }

  @OnInit()
  async configureFormatter(): Promise<void> {
    const { format } = this.config;

    const { providerId, moduleId } =
      this.container
        .getExtensions<string>(FORMATTER_EXTENSION)
        .find(({ options }) => options === format) ?? {};

    if (!providerId) {
      throw new ConfigurationException(`Logger formatter ${format} not found`, {
        format,
      });
    }

    const formatter = await this.container.resolveProvider(providerId, {
      moduleId,
    });

    if (!isObject(formatter) || !('formatLog' in formatter)) {
      throw new ConfigurationException(str`${format} is not a valid logger formatter`, {
        format,
        formatter,
      });
    }

    this.formatter = formatter as FormatterExtension;
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

    const buffer = this.formatter?.formatLog({
      level: {
        name,
        value,
      },
      message,
      error,
      data: data.length ? data : undefined,
      timestamp: new Date().toISOString(),
      ...formatOptions,
    });

    if (!buffer) {
      return;
    }

    this.stdout.write(`${buffer}\n`);
  }
}
