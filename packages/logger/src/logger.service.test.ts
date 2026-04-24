import { describe, expect, it } from 'bun:test';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  describe('configure', () => {
    it('configures a logger extension from registered extensions', async () => {
      const extension = {
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
        resolveProvider: async () => extension,
      };

      const service = new LoggerService(
        {
          level: 'DEBUG',
          format: 'json',
        },
        container as never,
      );

      await service.configure();

      expect(service).toBeDefined();
    });

    it('rejects missing and invalid logger extensions', async () => {
      const missing = new LoggerService({ level: 'DEBUG', format: 'pretty' }, {
        getExtensions: () => [],
      } as never);

      await expect(missing.configure()).rejects.toThrow(
        'Logger format pretty not supported',
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

      await expect(invalid.configure()).rejects.toThrow(
        'not-a-formatter is not a valid LoggerExtension',
      );
    });
  });

  describe('writeLog', () => {
    it('writes a formatted log to stdout when level is enabled', async () => {
      const output: string[] = [];
      const seen: unknown[] = [];
      const extension = {
        formatLog: (options: { message?: string; data?: unknown[] }) => {
          seen.push(options);
          return `formatted:${options.message ?? ''}`;
        },
      };
      const container = {
        getExtensions: () => [
          {
            providerId: Symbol.for('formatter'),
            moduleId: Symbol.for('module'),
            options: 'json',
          },
        ],
        resolveProvider: async () => extension,
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

      await service.configure();
      service.writeLog({
        level: 'INFO',
        args: ['hello', new Error('boom'), { extra: true }],
      });

      expect(output).toEqual(['formatted:hello\n']);
      expect(seen).toEqual([
        expect.objectContaining({
          message: 'hello',
          error: expect.any(Error),
          data: [{ extra: true }],
        }),
      ]);
    });

    it('skips logs below the configured level and missing formatted output', async () => {
      const output: string[] = [];
      const service = new LoggerService(
        {
          level: 'ERROR',
          format: 'json',
        },
        {
          getExtensions: () => [],
        } as never,
      );

      (service as unknown as { stdout: { write: (value: string) => void } }).stdout = {
        write: (value: string) => {
          output.push(value);
        },
      };

      service.writeLog({
        level: 'INFO',
        args: ['hidden'],
      });
      service.writeLog({
        level: 'ERROR',
        args: ['visible-but-unformatted'],
      });

      expect(output).toEqual([]);
    });
  });
});
