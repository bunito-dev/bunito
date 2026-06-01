import type { BrokerMessageHandler } from '../types';
import type { Payload } from '../utils';

export type TestBrokerContext = {
  id: number;
  requestId?: number;
};

export type TestBrokerTopicHandler = {
  pattern: RegExp;
  matched: BrokerMessageHandler<TestBrokerContext>[];
};

export type TestBrokerRequestCallback = (err: unknown, payload?: Payload) => void;
