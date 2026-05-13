import type { FSWatcher } from 'node:fs';
import { watch } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { clearTimeout, setTimeout } from 'node:timers';
import type { ResolveConfig } from '@bunito/config';
import { BrokerAdapter } from '../../broker-adapter';
import type { MessageHandler, MessagePayload } from '../../types';
import { LocalBrokerConfig } from './local-broker-config';
import type { LocalBrokerContext, LocalBrokerHandler } from './types';
import { compilePattern } from './utils';

@BrokerAdapter<LocalBrokerContext>({
  injects: [LocalBrokerConfig],
})
export class LocalBroker implements BrokerAdapter<LocalBrokerContext> {
  readonly NAME = 'local';

  private readonly handlers = new Map<string, LocalBrokerHandler>();

  private readonly requests = new Map<string, (err: unknown, data?: unknown) => void>();

  private watcher: undefined | FSWatcher;

  constructor(private readonly config: ResolveConfig<typeof LocalBrokerConfig>) {}

  private get mode(): LocalBroker['config']['mode'] {
    return this.config.mode;
  }

  async connect(): Promise<void> {
    if (this.mode === 'in-memory' || this.watcher) {
      return;
    }

    const { dataDir } = this.config;

    await mkdir(dataDir, { recursive: true });

    await this.clearData();

    this.watcher = watch(dataDir, { recursive: true }, this.processFileEvent);
  }

  async disconnect(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    this.watcher.close();

    await this.clearData();
  }

  async sendRequest(topic: string, data: unknown): Promise<unknown> {
    const id = Bun.randomUUIDv7();

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout;

      const callback = (err: unknown, data?: unknown): void => {
        if (!this.requests.delete(id)) {
          return;
        }

        clearTimeout(timeout);

        if (err) {
          reject(err);
          return;
        }

        resolve(data);
      };

      timeout = setTimeout(callback, this.config.timeout, new Error('Request timed out'));

      this.requests.set(id, callback);

      this.publishMessage({
        kind: 'request',
        data,
        topic,
        context: {
          id,
        },
      }).catch(callback);
    });
  }

  async sendEvent(topic: string, data: unknown): Promise<boolean> {
    await this.publishMessage({
      kind: 'event',
      data,
      topic,
      context: {
        id: Bun.randomUUIDv7(),
      },
    });

    return true;
  }

  async sendResponse(context: LocalBrokerContext, data: unknown): Promise<boolean> {
    const { id: requestId } = context;

    await this.publishMessage({
      kind: 'request',
      data,
      topic: 'response',
      context: {
        id: Bun.randomUUIDv7(),
        requestId,
      },
    });

    return true;
  }

  subscribe(pattern: string, handler: MessageHandler<LocalBrokerContext>): void {
    this.handlers
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
    payload: MessagePayload<LocalBrokerContext>,
  ): Promise<void> {
    if (!this.processMessage(payload)) {
      await this.writeMessage(payload);
    }
  }

  private processMessage(payload: MessagePayload<LocalBrokerContext>): boolean {
    const {
      topic,
      context: { requestId },
      data,
    } = payload;

    if (requestId) {
      const request = this.requests.get(requestId);

      if (request) {
        request(null, data);
        return true;
      }
    } else {
      for (const { pattern, matched } of this.handlers.values()) {
        if (!pattern.test(topic)) {
          continue;
        }

        for (const handler of matched) {
          handler(null, payload);
        }
      }
    }

    return false;
  }

  private async readMessage(
    file: Bun.BunFile,
  ): Promise<MessagePayload<LocalBrokerContext> | undefined> {
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

    return (await file.json()) as MessagePayload<LocalBrokerContext>;
  }

  private async writeMessage(payload: MessagePayload<LocalBrokerContext>): Promise<void> {
    if (this.mode === 'in-memory') {
      return;
    }

    const { id } = payload.context;

    const { uid, dataDir } = this.config;

    const path = join(dataDir, uid);
    const file = Bun.file(join(path, `${id}.json`));

    await mkdir(path, { recursive: true });

    await file.write(JSON.stringify(payload, null, 2));
  }

  private async clearData(): Promise<void> {
    const { dataDir } = this.config;

    for (const dir of await readdir(dataDir, { withFileTypes: true })) {
      if (!dir.isDirectory()) {
        continue;
      }

      try {
        await rm(join(dir.parentPath, dir.name), {
          recursive: true,
          force: true,
        });
      } catch {
        //
      }
    }
  }
}
