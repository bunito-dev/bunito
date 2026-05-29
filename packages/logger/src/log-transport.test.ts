import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { LogTransport } from './log-transport';

describe('LoggerTransport', () => {
  it('registers logger transports as indexed extensions', () => {
    @LogTransport({ scope: 'singleton' })
    class ExampleTransport implements LogTransport {
      readonly NAME = 'example';

      write(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleTransport, 'provider')).toEqual({
      decorator: LogTransport,
      options: {
        scope: 'singleton',
      },
    });
  });
});
