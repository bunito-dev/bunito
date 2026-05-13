import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { BrokerAdapter } from './broker-adapter';

describe('BrokerAdapter', () => {
  it('registers broker adapters as indexed extensions', () => {
    @BrokerAdapter({ scope: 'singleton' })
    class ExampleAdapter implements BrokerAdapter {
      readonly NAME = 'example';

      sendRequest(): undefined {
        return;
      }

      sendEvent(): boolean {
        return true;
      }

      sendResponse(): boolean {
        return true;
      }

      subscribe(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleAdapter, 'provider')).toEqual({
      decorator: BrokerAdapter,
      options: {
        scope: 'singleton',
      },
    });
  });
});
