import type { MessageHandler } from '../../types';

export type LocalBrokerContext = {
  id: string;
  requestId?: string;
};

export type LocalBrokerHandler = {
  pattern: RegExp;
  matched: MessageHandler<LocalBrokerContext>[];
};
