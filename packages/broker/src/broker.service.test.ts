import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container';
import { BrokerService } from './broker.service';
import type { BrokerAdapter } from './broker-adapter';
import { Context, Data, Subject, Topic } from './injections';
import type { BrokerMessage, BrokerMessageHandler } from './types';
import { Payload } from './utils';

class TestController {
  calls: unknown[][] = [];

  handle(...args: unknown[]): string {
    this.calls.push(args);

    return 'handled';
  }

  fail(): never {
    throw new Error('Handler failed');
  }
}

class TestAdapter implements BrokerAdapter {
  readonly NAME = 'test';

  connected = false;
  disconnected = false;
  subscriptions = new Map<string, BrokerMessageHandler>();
  requests: unknown[] = [];
  events: unknown[] = [];
  responses: unknown[] = [];
  unsubscribed: string[] = [];

  async connect(): Promise<void> {
    this.connected = true;
  }

  disconnect(): void {
    this.disconnected = true;
  }

  sendRequest(_topic: string, payload: Payload): Payload {
    this.requests.push(payload.decode());

    return Payload.create('response');
  }

  sendEvent(_topic: string, payload: Payload): boolean {
    this.events.push(payload.decode());

    return true;
  }

  sendResponse(_context: unknown, payload: Payload): boolean {
    this.responses.push(payload.decode());

    return true;
  }

  subscribe(pattern: string, handler: BrokerMessageHandler): () => void {
    this.subscriptions.set(pattern, handler);

    return () => {
      this.unsubscribed.push(pattern);
      this.subscriptions.delete(pattern);
    };
  }
}

describe('BrokerService', () => {
  it('rejects missing and unsupported adapters', () => {
    const container = {} as never;

    expect(
      () => new BrokerService({ adapter: undefined }, null, container, null),
    ).toThrow('No broker adapters are available');
    expect(
      () =>
        new BrokerService({ adapter: 'missing' }, null, container, [new TestAdapter()]),
    ).toThrow('Broker adapter "missing" is not supported');
  });

  it('connects adapters, subscribes located handlers, and resolves handler injections', async () => {
    const adapter = new TestAdapter();
    const controller = new TestController();
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');
    const container = {
      runInRequestContext: (handler: () => Promise<void>) => handler(),
      locateComponents: () => ({
        moduleId,
        props: [
          {
            propKind: 'class',
            options: {
              kind: 'prefix',
              prefix: 'root',
            },
          },
        ],
        controllers: [
          {
            providerId,
            options: {
              prefix: 'orders',
            },
            props: [
              {
                propKind: 'method',
                propKey: 'handle',
                options: {
                  kind: 'handler',
                  options: {
                    pattern: 'created',
                    injects: [Data(), Payload, Topic(), Subject(), Context()],
                  },
                },
              },
            ],
          },
        ],
      }),
      resolveProvider: (resolvedProviderId: unknown, options: { moduleId?: unknown }) => {
        expect(resolvedProviderId).toBe(providerId);
        expect(options.moduleId).toBe(moduleId);

        return controller;
      },
      resolveInjections: (
        injects: unknown[],
        options: {
          injectionResolver: (token: unknown) => Promise<unknown> | unknown;
          moduleId?: unknown;
        },
      ) => {
        expect(injects).toHaveLength(5);
        expect(options.moduleId).toBe(moduleId);

        return Promise.all([
          options.injectionResolver(Data),
          options.injectionResolver(Payload),
          options.injectionResolver(Topic),
          options.injectionResolver(Subject),
          options.injectionResolver(Context),
        ]);
      },
    };
    const service = new BrokerService({ adapter: 'test' }, null, container as never, [
      adapter,
    ]);

    await service.connectAdapter();

    expect(adapter.connected).toBeTrue();
    expect(adapter.subscriptions.has('root.orders.created')).toBeTrue();

    const payload: BrokerMessage = {
      kind: 'request',
      topic: 'root.orders.created',
      payload: Payload.create({
        id: 1,
      }),
      context: {
        requestId: 'abc',
      },
    };
    const subscription = adapter.subscriptions.get('root.orders.created');

    subscription?.(null, payload);
    await Bun.sleep(0);

    expect(controller.calls).toEqual([
      [
        {
          id: 1,
        },
        payload.payload,
        'root.orders.created',
        'root.orders.created',
        {
          requestId: 'abc',
        },
      ],
    ]);
    expect(adapter.responses).toEqual(['handled']);

    await service.disconnectAdapter();

    expect(adapter.disconnected).toBeTrue();
    expect(adapter.unsubscribed).toEqual(['root.orders.created']);
  });

  it('forwards request and event publishing to the selected adapter', async () => {
    const adapter = new TestAdapter();
    const service = new BrokerService({ adapter: undefined }, null, {} as never, [
      adapter,
    ]);

    const request = await service.sendRequest('orders.created', {});
    const event = await service.sendEvent('orders.created', {});

    expect(request).toBeDefined();
    expect(request?.decode<string>()).toBe('response');
    expect(event).toBeTrue();
    expect(adapter.requests).toEqual([{}]);
    expect(adapter.events).toEqual([{}]);
  });

  it('subscribes direct handlers, logs subscription errors, and unsubscribes', () => {
    const adapter = new TestAdapter();
    const errors: unknown[] = [];
    const received: unknown[] = [];
    const logger = {
      error: (err: unknown) => errors.push(err),
    };
    const service = new BrokerService({ adapter: 'test' }, logger as never, {} as never, [
      adapter,
    ]);
    const unsubscribe = service.subscribe('orders.created', (payload) => {
      received.push(payload.decode());
    });
    const subscription = adapter.subscriptions.get('orders.created');
    const error = new Error('Subscription failed');

    subscription?.(error);
    subscription?.(null);
    subscription?.(null, {
      kind: 'event',
      topic: 'orders.created',
      payload: Payload.create({
        id: 1,
      }),
      context: {},
    });

    expect(errors).toEqual([error]);
    expect(received).toEqual([
      {
        id: 1,
      },
    ]);

    unsubscribe();

    expect(adapter.unsubscribed).toEqual(['orders.created']);
    expect(adapter.subscriptions.has('orders.created')).toBeFalse();
  });

  it('handles empty component matches and subscription edge cases', async () => {
    const adapter = new TestAdapter();
    const errors: unknown[] = [];
    const logger = {
      setContext: () => null,
      error: (err: unknown) => errors.push(err),
    };
    const controller = new TestController();
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');
    const container = {
      runInRequestContext: (handler: () => Promise<void>) => handler(),
      locateComponents: () => ({
        moduleId,
        props: [
          {
            propKind: 'method',
            options: {},
          },
        ],
        controllers: [
          {
            providerId,
            options: {},
            props: [
              {
                propKind: 'class',
                options: {
                  kind: 'prefix',
                  prefix: 'orders',
                },
              },
              {
                propKind: 'method',
                propKey: 'missing',
                options: {
                  kind: 'handler',
                  options: {
                    pattern: 'missing',
                  },
                },
              },
              {
                propKind: 'method',
                propKey: 'handle',
                options: {
                  kind: 'handler',
                  options: {
                    pattern: 'event',
                  },
                },
              },
              {
                propKind: 'method',
                propKey: 'fail',
                options: {
                  kind: 'handler',
                  options: {
                    pattern: 'failed',
                  },
                },
              },
              {
                propKind: 'class',
                options: {
                  kind: 'ignored',
                },
              },
            ],
          },
        ],
        children: [
          {
            moduleId,
            props: [
              {
                propKind: 'class',
                options: {
                  kind: 'prefix',
                  prefix: 'child',
                },
              },
            ],
            controllers: [
              {
                providerId,
                options: {
                  prefix: 'audit',
                },
                props: [
                  {
                    propKind: 'method',
                    propKey: 'handle',
                    options: {
                      kind: 'handler',
                      options: {
                        pattern: 'logged',
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
      resolveProvider: () => controller,
      resolveInjections: () => [],
    };
    const service = new BrokerService(
      { adapter: 'test' },
      logger as never,
      container as never,
      [adapter],
    );

    await service.connectAdapter();

    adapter.subscriptions.get('orders.missing')?.(null, {
      kind: 'request',
      topic: 'orders.missing',
      payload: Payload.create({}),
      context: {},
    });
    adapter.subscriptions.get('orders.event')?.(null, {
      kind: 'event',
      topic: 'orders.event',
      payload: Payload.create({
        id: 1,
      }),
      context: {},
    });
    adapter.subscriptions.get('orders.event')?.(new Error('Subscription failed'));
    adapter.subscriptions.get('orders.event')?.(null);
    adapter.subscriptions.get('orders.failed')?.(null, {
      kind: 'request',
      topic: 'orders.failed',
      payload: Payload.create({}),
      context: {},
    });
    adapter.subscriptions.get('child.audit.logged')?.(null, {
      kind: 'event',
      topic: 'child.audit.logged',
      payload: Payload.create({
        id: 2,
      }),
      context: {},
    });

    await Bun.sleep(0);

    expect(adapter.subscriptions.has('orders.missing')).toBeTrue();
    expect(adapter.subscriptions.has('child.audit.logged')).toBeTrue();
    expect(controller.calls).toEqual([[], []]);
    expect(adapter.responses).toEqual([]);
    expect(errors).toHaveLength(2);
  });
});
