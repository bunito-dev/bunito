import { describe, expect, it } from 'bun:test';
import { InternalException } from '@bunito/common';
import { decode, encode } from '@msgpack/msgpack';
import type { BrokerMessage } from '../../types';
import { Payload } from '../../utils';
import { NatsBroker } from './nats-broker';
import type { NatsBrokerContext } from './types';

type SubscriptionCallback = (
  err: Error | null,
  msg: {
    data: Uint8Array;
    reply?: string;
    subject: string;
  },
) => void;

class TestConnection {
  closed = false;
  published: unknown[] = [];
  response = encode({
    ok: true,
  });
  subscriptions = new Map<string, SubscriptionCallback>();

  close(): void {
    this.closed = true;
  }

  async request(
    topic: string,
    data: Uint8Array,
  ): Promise<{
    data: Uint8Array;
  }> {
    this.published.push({
      topic,
      data,
      kind: 'request',
    });

    return {
      data: this.response,
    };
  }

  publish(topic: string, data: Uint8Array): void {
    this.published.push({
      topic,
      data,
      kind: 'event',
    });
  }

  subscribe(
    pattern: string,
    options: {
      queue: string;
      callback: SubscriptionCallback;
    },
  ): void {
    this.subscriptions.set(pattern, options.callback);
  }
}

function setConnection(broker: NatsBroker, connection: TestConnection): void {
  (
    broker as unknown as {
      connection: TestConnection;
    }
  ).connection = connection;
}

describe('NatsBroker', () => {
  it('rejects adapter operations before a connection is opened', async () => {
    const broker = new NatsBroker({
      servers: ['nats://localhost:4222'],
      queue: 'default',
    });

    let requestError: unknown;
    try {
      await broker.sendRequest('orders.created', Payload.create({}));
    } catch (err) {
      requestError = err;
    }

    let eventError: unknown;
    try {
      await broker.sendEvent('orders.created', Payload.create({}));
    } catch (err) {
      eventError = err;
    }

    expect(() => broker.subscribe('orders.*', () => {})).toThrow(
      'NATS connection is not available',
    );
    expect(requestError).toBeInstanceOf(InternalException);
    expect(eventError).toBeInstanceOf(InternalException);
  });

  it('uses an opened connection for requests, events, responses, and subscriptions', async () => {
    const broker = new NatsBroker({
      servers: ['nats://localhost:4222'],
      queue: 'orders',
    });
    const connection = new TestConnection();
    const received: BrokerMessage<NatsBrokerContext>[] = [];
    const errors: unknown[] = [];

    setConnection(broker, connection);

    const request = await broker.sendRequest(
      'orders.created',
      Payload.create({
        id: 1,
      }),
    );
    const event = await broker.sendEvent(
      'orders.created',
      Payload.create({
        id: 2,
      }),
    );
    const response = await broker.sendResponse(
      {
        respond: (payload: Uint8Array) =>
          JSON.stringify(decode(payload)) === JSON.stringify({ ok: true }),
      } as unknown as NatsBrokerContext,
      Payload.create({
        ok: true,
      }),
    );

    broker.subscribe('orders.*', (err, payload) => {
      if (err) {
        errors.push(err);
        return;
      }

      if (payload) {
        received.push(payload);
      }
    });

    connection.subscriptions.get('orders.*')?.(null, {
      data: encode({
        id: 3,
      }),
      reply: 'reply',
      subject: 'orders.created',
    });
    connection.subscriptions.get('orders.*')?.(null, {
      data: encode({
        id: 4,
      }),
      subject: 'orders.updated',
    });
    connection.subscriptions.get('orders.*')?.(new Error('failed'), {
      data: encode({
        id: 5,
      }),
      subject: 'orders.failed',
    });

    await broker.connect();
    await broker.disconnect();

    expect(request.decode<{ ok: boolean }>()).toEqual({
      ok: true,
    });
    expect(event).toBeTrue();
    expect(response).toBeTrue();
    expect(connection.published).toEqual([
      {
        topic: 'orders.created',
        data: encode({
          id: 1,
        }),
        kind: 'request',
      },
      {
        topic: 'orders.created',
        data: encode({
          id: 2,
        }),
        kind: 'event',
      },
    ]);
    expect(received).toEqual([
      {
        context: expect.any(Object),
        kind: 'request',
        topic: 'orders.created',
        payload: expect.objectContaining({
          data: expect.any(Uint8Array),
        }),
      },
      {
        context: expect.any(Object),
        kind: 'event',
        topic: 'orders.updated',
        payload: expect.objectContaining({
          data: expect.any(Uint8Array),
        }),
      },
    ]);
    expect(received.map((message) => message.payload.decode())).toEqual([
      {
        id: 3,
      },
      {
        id: 4,
      },
    ]);
    expect(errors).toHaveLength(1);
    expect(connection.closed).toBeTrue();
  });
});
