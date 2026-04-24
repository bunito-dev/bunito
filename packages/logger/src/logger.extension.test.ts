import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { LOGGER_EXTENSION } from './constants';
import { LoggerExtension } from './logger.extension';

describe('LoggerExtension', () => {
  it('registers a singleton logger extension with normalized format name', () => {
    @LoggerExtension('JSON', {
      injects: ['dependency'],
    })
    class TestExtension implements LoggerExtension {
      formatLog(): string {
        return 'log';
      }
    }

    expect(getDecoratorMetadata(TestExtension, 'extension')).toEqual({
      key: LOGGER_EXTENSION,
      options: 'json',
    });
    expect(getDecoratorMetadata(TestExtension, 'provider')).toEqual({
      options: {
        scope: 'singleton',
        injects: ['dependency'],
      },
    });
  });
});
