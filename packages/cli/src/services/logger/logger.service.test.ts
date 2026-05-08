import { describe, expect, it, spyOn } from 'bun:test';
import process from 'node:process';
import { Exception } from '#common';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  it('prints info, warnings, errors, and blank lines', () => {
    const output: string[] = [];
    const write = spyOn(process.stdout, 'write').mockImplementation(((chunk: string) => {
      output.push(chunk);
      return true;
    }) as typeof process.stdout.write);

    try {
      const logger = new LoggerService();

      expect(logger.info('Created', 'file.ts')).toBe(logger);
      expect(logger.warn(new Exception('Careful', 'details'))).toBe(logger);
      expect(logger.error(new Error('Boom'))).toBe(logger);
      logger.br();
    } finally {
      write.mockRestore();
    }

    const text = output.join('');

    expect(text).toContain('Created');
    expect(text).toContain('file.ts');
    expect(text).toContain('Careful');
    expect(text).toContain('details');
    expect(text).toContain('Boom');
    expect(text.endsWith('\n')).toBeTrue();
  });
});
