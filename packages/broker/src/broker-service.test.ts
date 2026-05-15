import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container';
import type { BrokerAdapter } from './broker-adapter';
import { BrokerService } from './broker-service';
import { Context, Data, Subject, Topic } from './injections';
import type { BrokerMessage, BrokerMessageHandler } from './types';

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
  responses: unknown[] = [];

  async connect(): Promise<void> {
    this.connected = true;
  }

  disconnect(): void {
    this.disconnected = true;
  }

  sendRequest(): string {
    return 'response';
  }

  sendEvent(): boolean {
    return true;
  }

  sendResponse(_context: unknown, data: unknown): boolean {
    this.responses.push(data);

    return true;
  }

  subscribe(pattern: string, handler: BrokerMessageHandler): void {
    this.subscriptions.set(pattern, handler);
  }
}

describe('BrokerService', () => {
  it('rejects missing and unsupported adapters', () => {
    const container = {} as never;

    expect(
      () => new BrokerService({ adapter: undefined }, null, container, null),
    ).toThrow('No adapters are available');
    expect(
      () =>
        new BrokerService({ adapter: 'missing' }, null, container, [new TestAdapter()]),
    ).toThrow('Adapter missing is not supported');
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
                    injects: [Data(), Topic(), Subject(), Context()],
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
        expect(injects).toHaveLength(4);
        expect(options.moduleId).toBe(moduleId);

        return Promise.all([
          options.injectionResolver(Data),
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
      payload: {
        id: 1,
      },
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
  });

  it('forwards request and event publishing to the selected adapter', async () => {
    const adapter = new TestAdapter();
    const service = new BrokerService({ adapter: undefined }, null, {} as never, [
      adapter,
    ]);

    const request = await service.sendRequest('orders.created', {});
    const event = await service.sendEvent('orders.created', {});

    expect(request).toBe('response');
    expect(event).toBeTrue();
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
      payload: {},
      context: {},
    });
    adapter.subscriptions.get('orders.event')?.(null, {
      kind: 'event',
      topic: 'orders.event',
      payload: {
        id: 1,
      },
      context: {},
    });
    adapter.subscriptions.get('orders.event')?.(new Error('Subscription failed'));
    adapter.subscriptions.get('orders.event')?.(null);
    adapter.subscriptions.get('orders.failed')?.(null, {
      kind: 'request',
      topic: 'orders.failed',
      payload: {},
      context: {},
    });
    adapter.subscriptions.get('child.audit.logged')?.(null, {
      kind: 'event',
      topic: 'child.audit.logged',
      payload: {
        id: 2,
      },
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
