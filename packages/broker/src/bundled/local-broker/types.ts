import type { BrokerMessageHandler } from '../../types';

export type LocalBrokerContext = {
  id: string;
  requestId?: string;
};

export type LocalBrokerTopicHandler = {
  pattern: RegExp;
  matched: BrokerMessageHandler<LocalBrokerContext>[];
};

export type LocalBrokerRequestCallback = (err: unknown, payload?: Uint8Array) => void;
