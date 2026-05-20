import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container';
import { Test, TestException } from '@bunito/testing';
import { Logger } from '../logger';
import { LoggerModule } from '../logger-module';
import { TestLogger } from './test-logger';
import './index';

describe('logger testing definitions', () => {
  it('registers logger module and lookup test factories', () => {
    const context = Test as unknown as {
      LoggerModule: unknown;
      getLogger: (context: unknown) => TestLogger;
    };

    expect(context.LoggerModule).toEqual({
      token: LoggerModule,
      providers: [TestLogger],
      exports: [Logger],
    });

    const logger = new TestLogger(Id.for('job'));
    const repeated = new TestLogger(Id.for('job'));

    logger.fatal('fatal');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.ok('ok');
    logger.verbose('verbose');
    logger.debug('debug');

    expect(context.getLogger('job')).toBe(logger);
    expect(repeated).not.toBe(logger);
    expect(new TestLogger().track('child')).toBeInstanceOf(TestLogger);
    expect(logger.fatal).toHaveBeenCalledWith('fatal');
    expect(logger.error).toHaveBeenCalledWith('error');
    expect(logger.warn).toHaveBeenCalledWith('warn');
    expect(logger.info).toHaveBeenCalledWith('info');
    expect(logger.ok).toHaveBeenCalledWith('ok');
    expect(logger.verbose).toHaveBeenCalledWith('verbose');
    expect(logger.debug).toHaveBeenCalledWith('debug');
    expect(() => context.getLogger('missing')).toThrow(
      new TestException(`No logger found for context ${Id.for('missing')}`),
    );
  });
});
