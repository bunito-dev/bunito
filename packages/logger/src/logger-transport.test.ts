import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { LoggerTransport } from './logger-transport';

describe('LoggerTransport', () => {
  it('registers logger transports as indexed extensions', () => {
    @LoggerTransport({ scope: 'singleton' })
    class ExampleTransport implements LoggerTransport {
      readonly NAME = 'example';

      write(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleTransport, 'provider')).toEqual({
      decorator: LoggerTransport,
      options: {
        scope: 'singleton',
      },
    });
  });
});
