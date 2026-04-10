import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigService } from '../config';
import type { ClassProviderMetadata, LifecycleProps } from '../container';
import { CONTAINER_METADATA_KEYS } from '../container';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

class RecordingFormatter {
  static lastInstance: RecordingFormatter | undefined;

  configuredWith: ConfigService | undefined;

  formatLogCalls: unknown[] = [];

  returnValue: string | undefined = 'formatted';

  constructor() {
    RecordingFormatter.lastInstance = this;
  }

  configure(configService: ConfigService): void {
    this.configuredWith = configService;
  }

  formatLog(options: unknown): string | undefined {
    this.formatLogCalls.push(options);
    return this.returnValue;
  }
}

LoggerService.registerFormatter('unit-test', RecordingFormatter as never);
LoggerService.registerFormatter(
  'empty',
  class {
    formatLog(): string | undefined {
      return undefined;
    }
  } as never,
);

describe('LoggerService', () => {
  it('should be registered as a singleton provider with an init lifecycle hook', () => {
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        LoggerService,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
      injects: [LoggerConfig, ConfigService],
    });
    expect(
      getDecoratorMetadata<LifecycleProps>(
        LoggerService,
        CONTAINER_METADATA_KEYS.ON_LIFECYCLE,
      ),
    ).toEqual(new Map([['onInit', 'configureFormatter']]));
  });

  it('should configure and use the registered formatter', () => {
    const configService = {
      getEnvAs() {
        return undefined;
      },
    } as unknown as ConfigService;
    const writes: string[] = [];
    const service = new LoggerService(
      {
        level: 'INFO',
        format: 'unit-test',
      },
      configService,
    );

    (service as unknown as { stdout: { write: (chunk: string) => void } }).stdout = {
      write(chunk: string) {
        writes.push(chunk);
      },
    };

    service.configureFormatter();
    service.writeLog({
      level: 'ERROR',
      context: 'App',
      traceId: 3,
      args: ['message', new Error('boom'), { foo: 'bar' }],
    });

    expect(RecordingFormatter.lastInstance?.configuredWith).toBe(configService);
    expect(RecordingFormatter.lastInstance?.formatLogCalls).toHaveLength(1);
    expect(writes).toEqual(['formatted\n']);
    expect(RecordingFormatter.lastInstance?.formatLogCalls[0]).toMatchObject({
      level: {
        kind: 'ERROR',
        value: 50,
      },
      context: 'App',
      traceId: 3,
      message: 'message',
      error: expect.any(Error),
      data: [{ foo: 'bar' }],
      timestamp: expect.any(String),
    });
  });

  it('should skip logs below the configured level and when formatter output is empty', () => {
    const writes: string[] = [];
    const service = new LoggerService(
      {
        level: 'ERROR',
        format: 'empty',
      },
      new ConfigService(),
    );

    (service as unknown as { stdout: { write: (chunk: string) => void } }).stdout = {
      write(chunk: string) {
        writes.push(chunk);
      },
    };

    service.writeLog({
      level: 'INFO',
      args: ['ignored'],
    });
    service.writeLog({
      level: 'ERROR',
      args: [new Error('boom'), 'context'],
    });

    expect(writes).toEqual([]);
  });

  it('should ignore writes when no formatter is registered', () => {
    const writes: string[] = [];
    const service = new LoggerService(
      {
        level: 'VERBOSE',
        format: 'missing',
      },
      new ConfigService(),
    );

    (service as unknown as { stdout: { write: (chunk: string) => void } }).stdout = {
      write(chunk: string) {
        writes.push(chunk);
      },
    };

    service.writeLog({
      level: 'VERBOSE',
      args: ['hello'],
    });

    expect(writes).toEqual([]);
  });
});
