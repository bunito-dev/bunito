import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container/internals';
import { BROKER_CONTROLLER_KEY } from '../constants';
import { Data } from '../injection';
import { OnMessage } from './on-message';

describe('OnMessage', () => {
  it('stores handler metadata from a pattern string', () => {
    class MessagesController {
      @OnMessage('orders.created', {
        injects: [Data()],
      })
      handle(): void {
        //
      }
    }

    expect(getControllerProps(MessagesController, BROKER_CONTROLLER_KEY)).toEqual([
      {
        propKind: 'method',
        propKey: 'handle',
        options: {
          kind: 'handler',
          options: {
            pattern: 'orders.created',
            injects: [
              {
                useToken: Data,
              },
            ],
          },
        },
      },
    ]);
  });

  it('stores handler metadata from an options object', () => {
    class MessagesController {
      @OnMessage({ pattern: 'orders.*' })
      handle(): void {
        //
      }
    }

    expect(getControllerProps(MessagesController, BROKER_CONTROLLER_KEY)).toEqual([
      {
        propKind: 'method',
        propKey: 'handle',
        options: {
          kind: 'handler',
          options: {
            pattern: 'orders.*',
          },
        },
      },
    ]);
  });
});
