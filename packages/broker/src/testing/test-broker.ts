import { mock } from 'bun:test';
import { clearTimeout, setTimeout } from 'node:timers';
import { InternalException } from '@bunito/common';
import type { MockedObject } from '@bunito/testing';
import { BrokerAdapter } from '../broker-adapter';
import type { BrokerMessage, BrokerMessageHandler } from '../types';
import type { Payload } from '../utils';
import { compilePattern } from '../utils';
import type {
  TestBrokerContext,
  TestBrokerRequestCallback,
  TestBrokerTopicHandler,
} from './types';

@BrokerAdapter<TestBrokerContext>()
export class TestBroker implements MockedObject<BrokerAdapter<TestBrokerContext>> {
  readonly NAME = 'TESTING';

  private timeout = 1000;

  private nextId = 1;

  private readonly topicHandlers = new Map<string, TestBrokerTopicHandler>();

  private readonly requestCallbacks = new Map<number, TestBrokerRequestCallback>();

  private getNextId(): number {
    return this.nextId++;
  }

  setTimeout(value: number): void {
    this.timeout = value;
  }

  connect = mock();

  disconnect = mock();

  sendRequest = mock(async (topic: string, payload: Payload): Promise<Payload> => {
    const id = this.getNextId();

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout;

      const callback: TestBrokerRequestCallback = (err, payload): void => {
        if (!this.requestCallbacks.delete(id)) {
          return;
        }

        clearTimeout(timeout);

        if (err || !payload) {
          reject(err);
          return;
        }

        resolve(payload);
      };

      timeout = setTimeout(
        callback,
        this.timeout,
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
  });

  sendEvent = mock(async (topic: string, payload: Payload): Promise<boolean> => {
    await this.publishMessage({
      kind: 'event',
      payload,
      topic,
      context: {
        id: this.getNextId(),
      },
    });

    return true;
  });

  sendResponse = mock(
    async (context: TestBrokerContext, payload: Payload): Promise<boolean> => {
      const { id: requestId } = context;

      await this.publishMessage({
        kind: 'request',
        payload,
        topic: 'response',
        context: {
          id: this.getNextId(),
          requestId,
        },
      });

      return true;
    },
  );

  subscribe = mock(
    (pattern: string, handler: BrokerMessageHandler<TestBrokerContext>) => {
      this.topicHandlers
        .getOrInsertComputed(pattern, () => ({
          pattern: compilePattern(pattern),
          matched: new Set(),
        }))
        .matched.add(handler);

      return mock(() => {
        this.topicHandlers.get(pattern)?.matched.delete(handler);
      });
    },
  );

  private async publishMessage(message: BrokerMessage<TestBrokerContext>): Promise<void> {
    this.processMessage(message);
  }

  private processMessage(message: BrokerMessage<TestBrokerContext>): boolean {
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
}
