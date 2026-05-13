import { describe, expect, it } from 'bun:test';
import { NatsBroker } from './nats-broker';
import type { NatsBrokerContext } from './types';

type SubscriptionCallback = (
  err: Error | null,
  msg: {
    json: <T>() => T;
    reply?: string;
    subject: string;
  },
) => void;

class TestConnection {
  closed = false;
  published: unknown[] = [];
  response = {
    ok: true,
  };
  subscriptions = new Map<string, SubscriptionCallback>();

  close(): void {
    this.closed = true;
  }

  async request(
    topic: string,
    data: string,
  ): Promise<{
    json: () => unknown;
  }> {
    this.published.push({
      topic,
      data,
      kind: 'request',
    });

    return {
      json: () => this.response,
    };
  }

  publish(topic: string, data: string): void {
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
  it('returns safe fallback results before a connection is opened', async () => {
    const broker = new NatsBroker({
      servers: ['nats://localhost:4222'],
      queue: 'default',
    });

    const request = await broker.sendRequest('orders.created', {});
    const event = await broker.sendEvent('orders.created', {});

    broker.subscribe('orders.*', () => {
      throw new Error('subscribe should be a no-op without a connection');
    });

    expect(request).toBeUndefined();
    expect(event).toBeFalse();
  });

  it('uses an opened connection for requests, events, responses, and subscriptions', async () => {
    const broker = new NatsBroker({
      servers: ['nats://localhost:4222'],
      queue: 'orders',
    });
    const connection = new TestConnection();
    const received: unknown[] = [];
    const errors: unknown[] = [];

    setConnection(broker, connection);

    const request = await broker.sendRequest('orders.created', {
      id: 1,
    });
    const event = await broker.sendEvent('orders.created', {
      id: 2,
    });
    const response = await broker.sendResponse(
      {
        respond: (data: string) => data === '{"ok":true}',
      } as unknown as NatsBrokerContext,
      {
        ok: true,
      },
    );

    broker.subscribe('orders.*', (err, payload) => {
      if (err) {
        errors.push(err);
        return;
      }

      received.push(payload);
    });

    connection.subscriptions.get('orders.*')?.(null, {
      json: <T>() =>
        ({
          id: 3,
        }) as T,
      reply: 'reply',
      subject: 'orders.created',
    });
    connection.subscriptions.get('orders.*')?.(null, {
      json: <T>() =>
        ({
          id: 4,
        }) as T,
      subject: 'orders.updated',
    });
    connection.subscriptions.get('orders.*')?.(new Error('failed'), {
      json: <T>() =>
        ({
          id: 5,
        }) as T,
      subject: 'orders.failed',
    });

    await broker.connect();
    await broker.disconnect();

    expect(request).toEqual({
      ok: true,
    });
    expect(event).toBeTrue();
    expect(response).toBeTrue();
    expect(connection.published).toEqual([
      {
        topic: 'orders.created',
        data: '{"id":1}',
        kind: 'request',
      },
      {
        topic: 'orders.created',
        data: '{"id":2}',
        kind: 'event',
      },
    ]);
    expect(received).toEqual([
      {
        context: expect.any(Object),
        kind: 'request',
        topic: 'orders.created',
        data: {
          id: 3,
        },
      },
      {
        context: expect.any(Object),
        kind: 'event',
        topic: 'orders.updated',
        data: {
          id: 4,
        },
      },
    ]);
    expect(errors).toHaveLength(1);
    expect(connection.closed).toBeTrue();
  });
});
