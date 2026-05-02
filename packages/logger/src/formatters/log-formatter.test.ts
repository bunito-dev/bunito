import { describe, expect, it } from 'bun:test';
import { getProviderMetadata } from '@bunito/container/internals';
import { LogFormatter } from './log-formatter';

describe('LogFormatter', () => {
  it('registers singleton log formatter extensions by default', () => {
    @LogFormatter({ injects: ['config'] })
    class ExampleFormatter implements LogFormatter {
      readonly logFormat = 'example';

      formatLog(): string {
        return 'log';
      }
    }

    expect(getProviderMetadata(ExampleFormatter)).toEqual({
      decorator: LogFormatter,
      options: {
        scope: 'singleton',
        injects: ['config'],
      },
    });
  });
});
