import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { LogFormatter } from './log-formatter';

describe('LogFormatter', () => {
  it('registers singleton log formatter extensions by default', () => {
    @LogFormatter({ injects: ['config'] })
    class ExampleFormatter implements LogFormatter {
      readonly NAME = 'example';

      formatLog(): string {
        return 'log';
      }
    }

    expect(getClassMetadata(ExampleFormatter, 'provider')).toEqual({
      decorator: LogFormatter,
      options: {
        injects: ['config'],
      },
    });
  });
});
