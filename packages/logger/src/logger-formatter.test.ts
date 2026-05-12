import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { LoggerFormatter } from './logger-formatter';

describe('LogFormatter', () => {
  it('registers singleton log formatter extensions by default', () => {
    @LoggerFormatter({ injects: ['config'] })
    class ExampleFormatter implements LoggerFormatter {
      readonly NAME = 'example';

      formatLog(): string {
        return 'log';
      }
    }

    expect(getClassMetadata(ExampleFormatter, 'provider')).toEqual({
      decorator: LoggerFormatter,
      options: {
        scope: 'singleton',
        injects: ['config'],
      },
    });
  });
});
