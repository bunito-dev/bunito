import type { BrokerMessageHandler } from '../../types';
import type { Payload } from '../../utils';

export type LocalBrokerContext = {
  id: string;
  requestId?: string;
};

export type LocalBrokerTopicHandler = {
  pattern: RegExp;
  matched: BrokerMessageHandler<LocalBrokerContext>[];
};

export type LocalBrokerRequestCallback = (err: unknown, payload?: Payload) => void;
