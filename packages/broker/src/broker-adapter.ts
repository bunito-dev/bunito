import type { MaybePromise } from '@bunito/common';
import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { BrokerMessageHandler } from './types';
import type { Payload } from './utils';

export interface BrokerAdapter<TContext = unknown> {
  readonly NAME: string;

  connect?: () => Promise<void>;

  disconnect?: () => MaybePromise<void>;

  sendRequest(topic: string, payload: Payload): MaybePromise<Payload | undefined>;

  sendEvent(topic: string, payload: Payload): MaybePromise<boolean>;

  sendResponse(context: TContext, payload: Payload): MaybePromise<boolean>;

  subscribe(pattern: string, handler: BrokerMessageHandler<TContext>): MaybePromise<void>;
}

export function BrokerAdapter<TContext = unknown>(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<BrokerAdapter<TContext>> {
  return createExtensionDecorator(BrokerAdapter, options);
}
