import { describe, expect, it } from 'bun:test';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { LocalBroker } from './local-broker';
import type { LocalBrokerContext } from './types';

describe('LocalBroker', () => {
  it('routes in-memory requests to matching subscribers and sends responses', async () => {
    const broker = new LocalBroker({
      mode: 'in-memory',
      uid: 'test',
      timeout: 250,
      dataDir: '/tmp/bunito-broker-test',
    });

    await broker.connect();

    broker.subscribe('orders.*', (_err, payload) => {
      if (!payload) {
        return;
      }

      broker.sendResponse(payload.context, {
        received: payload.data,
      });
    });

    const response = await broker.sendRequest('orders.created', {
      id: 1,
    });

    expect(response).toEqual({
      received: {
        id: 1,
      },
    });

    await broker.disconnect();
  });

  it('rejects in-memory requests that time out', async () => {
    const broker = new LocalBroker({
      mode: 'in-memory',
      uid: 'test',
      timeout: 5,
      dataDir: '/tmp/bunito-broker-test',
    });

    try {
      await broker.sendRequest('orders.created', {});
      throw new Error('Request should time out');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe('Request timed out');
    }
  });

  it('writes, reads, and clears filesystem transport messages', async () => {
    const dataDir = join('/tmp', `bunito-broker-${Bun.randomUUIDv7()}`);
    const reader = new LocalBroker({
      mode: 'fs',
      uid: 'reader',
      timeout: 250,
      dataDir,
    });
    const writer = new LocalBroker({
      mode: 'fs',
      uid: 'writer',
      timeout: 250,
      dataDir,
    });
    const readMessage = (
      reader as unknown as {
        readMessage: (file: Bun.BunFile) => Promise<
          | {
              context: LocalBrokerContext;
              data: unknown;
              kind: 'request';
              topic: string;
            }
          | undefined
        >;
      }
    ).readMessage.bind(reader);
    const publishMessage = (
      writer as unknown as {
        publishMessage: (payload: {
          kind: 'request';
          topic: string;
          data: unknown;
          context: LocalBrokerContext;
        }) => Promise<void>;
      }
    ).publishMessage.bind(writer);

    try {
      await mkdir(join(dataDir, 'reader'), { recursive: true });
      await Bun.file(join(dataDir, 'reader', 'own.json')).write('{}');
      await publishMessage({
        kind: 'request',
        topic: 'orders.created',
        data: {
          id: 1,
        },
        context: {
          id: 'message',
        },
      });

      const missing = await readMessage(Bun.file(join(dataDir, 'missing.json')));
      const directory = await readMessage(Bun.file(join(dataDir, 'reader')));
      const own = await readMessage(Bun.file(join(dataDir, 'reader', 'own.json')));
      const written = await readMessage(
        Bun.file(join(dataDir, 'writer', 'message.json')),
      );

      expect(missing).toBeUndefined();
      expect(directory).toBeUndefined();
      expect(own).toBeUndefined();
      expect(written).toEqual({
        kind: 'request',
        topic: 'orders.created',
        data: {
          id: 1,
        },
        context: {
          id: 'message',
        },
      });

      await reader.connect();
      expect(await readdir(dataDir)).toEqual([]);

      await reader.disconnect();
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });

  it('processes filesystem watcher events', async () => {
    const dataDir = join('/tmp', `bunito-broker-${Bun.randomUUIDv7()}`);
    const reader = new LocalBroker({
      mode: 'fs',
      uid: 'reader',
      timeout: 250,
      dataDir,
    });
    const writer = new LocalBroker({
      mode: 'fs',
      uid: 'writer',
      timeout: 250,
      dataDir,
    });
    const received: unknown[] = [];
    const publishMessage = (
      writer as unknown as {
        publishMessage: (payload: {
          kind: 'event';
          topic: string;
          data: unknown;
          context: LocalBrokerContext;
        }) => Promise<void>;
      }
    ).publishMessage.bind(writer);
    const processFileEvent = (
      reader as unknown as {
        processFileEvent: (event: string, relativePath: string | null) => void;
      }
    ).processFileEvent.bind(reader);

    try {
      reader.subscribe('orders.*', (_err, payload) => {
        received.push(payload?.data);
      });

      processFileEvent('change', null);

      await publishMessage({
        kind: 'event',
        topic: 'orders.created',
        data: {
          id: 1,
        },
        context: {
          id: 'message',
        },
      });

      processFileEvent('rename', join('writer', 'message.json'));

      for (let attempt = 0; attempt < 20 && !received.length; attempt += 1) {
        await Bun.sleep(50);
      }

      expect(received).toEqual([
        {
          id: 1,
        },
      ]);
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });

  it('publishes events with event payload kind', async () => {
    const broker = new LocalBroker({
      mode: 'in-memory',
      uid: 'test',
      timeout: 250,
      dataDir: '/tmp/bunito-broker-test',
    });
    let kind: unknown;

    broker.subscribe('orders.*', (_err, payload) => {
      kind = payload?.kind;
    });

    await broker.sendEvent('orders.created', {});

    expect(kind).toBe('event');
  });
});
