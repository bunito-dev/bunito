import { describe, expect, it } from 'bun:test';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  describe('configureFormatter', () => {
    it('configures a formatter from registered extensions', async () => {
      const formatter = {
        formatLog: (options: { message?: string }) =>
          `formatted:${options.message ?? ''}`,
      };
      const container = {
        getExtensions: () => [
          {
            providerId: Symbol.for('formatter'),
            moduleId: Symbol.for('module'),
            options: 'json',
          },
        ],
        resolveProvider: async () => formatter,
      };

      const service = new LoggerService(
        {
          level: 'DEBUG',
          format: 'json',
        },
        container as never,
      );

      await service.configureFormatter();

      expect(service).toBeDefined();
    });

    it('rejects missing and invalid formatter extensions', async () => {
      const missing = new LoggerService({ level: 'DEBUG', format: 'pretty' }, {
        getExtensions: () => [],
      } as never);

      expect(missing.configureFormatter()).rejects.toThrow(
        'Logger formatter pretty not found',
      );

      const invalid = new LoggerService({ level: 'DEBUG', format: 'pretty' }, {
        getExtensions: () => [
          {
            providerId: Symbol.for('formatter'),
            moduleId: Symbol.for('module'),
            options: 'pretty',
          },
        ],
        resolveProvider: async () => 'not-a-formatter',
      } as never);

      expect(invalid.configureFormatter()).rejects.toThrow(
        'pretty is not a valid logger formatter',
      );
    });
  });

  describe('writeLog', () => {
    it('writes a formatted log to stdout when level is enabled', async () => {
      const output: string[] = [];
      const formatter = {
        formatLog: (options: { message?: string }) =>
          `formatted:${options.message ?? ''}`,
      };
      const container = {
        getExtensions: () => [
          {
            providerId: Symbol.for('formatter'),
            moduleId: Symbol.for('module'),
            options: 'json',
          },
        ],
        resolveProvider: async () => formatter,
      };

      const service = new LoggerService(
        {
          level: 'DEBUG',
          format: 'json',
        },
        container as never,
      );

      (service as unknown as { stdout: { write: (value: string) => void } }).stdout = {
        write: (value: string) => {
          output.push(value);
        },
      };

      await service.configureFormatter();
      service.writeLog({
        level: 'INFO',
        args: ['hello', new Error('boom'), { extra: true }],
      });

      expect(output).toEqual(['formatted:hello\n']);
    });
  });
});
