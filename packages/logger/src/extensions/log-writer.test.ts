import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { LogWriter } from './log-writer';

describe('LogWriter', () => {
  it('registers log writers as indexed extensions', () => {
    @LogWriter({ global: true })
    class ExampleWriter implements LogWriter {
      readonly NAME = 'example';

      writeLog(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleWriter, 'provider')).toEqual({
      decorator: LogWriter,
      options: {
        global: true,
      },
    });
  });
});
