import type { FSWatcher } from 'node:fs';
import { watch } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { clearTimeout, setTimeout } from 'node:timers';
import { InternalException } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { BrokerAdapter } from '../../broker-adapter';
import type { BrokerMessage, BrokerMessageHandler } from '../../types';
import { LocalBrokerConfig } from './local-broker-config';
import type {
  LocalBrokerContext,
  LocalBrokerRequestCallback,
  LocalBrokerTopicHandler,
} from './types';
import { compilePattern } from './utils';

@BrokerAdapter<LocalBrokerContext>({
  injects: [LocalBrokerConfig],
})
export class LocalBroker implements BrokerAdapter<LocalBrokerContext> {
  readonly NAME = 'local';

  private readonly topicHandlers = new Map<string, LocalBrokerTopicHandler>();

  private readonly requestCallbacks = new Map<string, LocalBrokerRequestCallback>();

  private watcher: undefined | FSWatcher;

  constructor(private readonly config: ResolveConfig<typeof LocalBrokerConfig>) {}

  private get mode(): LocalBroker['config']['mode'] {
    return this.config.mode;
  }

  private get dataDir(): string {
    const { dataDir, uid } = this.config;

    return join(dataDir, uid);
  }

  async connect(): Promise<void> {
    if (this.mode === 'in-memory' || this.watcher) {
      return;
    }

    const { dataDir } = this.config;

    await this.removeData();

    await mkdir(this.dataDir, { recursive: true });

    this.watcher = watch(dataDir, { recursive: true }, this.processFileEvent);
  }

  async disconnect(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    this.watcher.close();

    await this.removeData();
  }

  async sendRequest(topic: string, payload: Uint8Array): Promise<Uint8Array | undefined> {
    const id = Bun.randomUUIDv7();

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout;

      const callback: LocalBrokerRequestCallback = (err, payload): void => {
        if (!this.requestCallbacks.delete(id)) {
          return;
        }

        clearTimeout(timeout);

        if (err) {
          reject(err);
          return;
        }

        resolve(payload);
      };

      timeout = setTimeout(
        callback,
        this.config.timeout,
        new InternalException('Request timed out'),
      );

      this.requestCallbacks.set(id, callback);

      this.publishMessage({
        kind: 'request',
        payload,
        topic,
        context: {
          id,
        },
      }).catch(callback);
    });
  }

  async sendEvent(topic: string, payload: Uint8Array): Promise<boolean> {
    await this.publishMessage({
      kind: 'event',
      payload,
      topic,
      context: {
        id: Bun.randomUUIDv7(),
      },
    });

    return true;
  }

  async sendResponse(context: LocalBrokerContext, payload: Uint8Array): Promise<boolean> {
    const { id: requestId } = context;

    await this.publishMessage({
      kind: 'request',
      payload,
      topic: 'response',
      context: {
        id: Bun.randomUUIDv7(),
        requestId,
      },
    });

    return true;
  }

  subscribe(pattern: string, handler: BrokerMessageHandler<LocalBrokerContext>): void {
    this.topicHandlers
      .getOrInsertComputed(pattern, () => ({
        pattern: compilePattern(pattern),
        matched: [],
      }))
      .matched.push(handler);
  }

  private readonly processFileEvent = async (
    event: string,
    relativePath: string | null,
  ): Promise<void> => {
    if (event !== 'rename' || !relativePath) {
      return;
    }

    try {
      const payload = await this.readMessage(
        Bun.file(join(this.config.dataDir, relativePath)),
      );

      if (!payload) {
        return;
      }

      this.processMessage(payload);
    } catch {
      return;
    }
  };

  private async publishMessage(
    message: BrokerMessage<LocalBrokerContext>,
  ): Promise<void> {
    if (!this.processMessage(message)) {
      await this.writeMessage(message);
    }
  }

  private processMessage(message: BrokerMessage<LocalBrokerContext>): boolean {
    const {
      topic,
      context: { requestId },
      payload,
    } = message;

    if (requestId) {
      const requestCallback = this.requestCallbacks.get(requestId);

      if (requestCallback) {
        requestCallback(null, payload);
        return true;
      }
    } else {
      for (const { pattern, matched } of this.topicHandlers.values()) {
        if (!pattern.test(topic)) {
          continue;
        }

        for (const handler of matched) {
          handler(null, message);
        }
      }
    }

    return false;
  }

  private async readMessage(
    file: Bun.BunFile,
  ): Promise<BrokerMessage<LocalBrokerContext> | undefined> {
    let isFile = false;

    try {
      isFile = (await file.stat()).isFile();
    } catch {
      //
    }

    if (!file.name || !(await file.exists()) || !isFile) {
      return;
    }

    const { uid } = this.config;
    const [sender] = file.name.split(sep).slice(-2);

    if (!sender || sender === uid) {
      return;
    }

    const content = await file.json();

    const { payload, ...common } = content as BrokerMessage<LocalBrokerContext>;

    return {
      ...common,
      payload: Uint8Array.from(payload),
    };
  }

  private async writeMessage(message: BrokerMessage<LocalBrokerContext>): Promise<void> {
    if (this.mode === 'in-memory') {
      return;
    }

    const { id } = message.context;

    const { uid, dataDir } = this.config;

    const path = join(dataDir, uid);
    const file = Bun.file(join(path, `${id}.json`));

    await mkdir(path, { recursive: true });

    const { payload, ...common } = message;

    await file.write(
      JSON.stringify(
        {
          ...common,
          payload: Array.from(payload),
        },
        null,
        2,
      ),
    );
  }

  private async removeData(): Promise<void> {
    const dataFile = Bun.file(this.dataDir);
    const dataStats = await dataFile.stat().catch(() => null);

    if (!dataStats?.isDirectory()) {
      return;
    }

    await rm(this.dataDir, {
      recursive: true,
    });
  }
}
