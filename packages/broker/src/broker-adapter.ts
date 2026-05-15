import type { MaybePromise } from '@bunito/common';
import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { BrokerMessageHandler } from './types';

export interface BrokerAdapter<TContext = unknown> {
  readonly NAME: string;

  connect?: () => Promise<void>;

  disconnect?: () => MaybePromise<void>;

  sendRequest(topic: string, payload: Uint8Array): MaybePromise<Uint8Array | undefined>;

  sendEvent(topic: string, payload: Uint8Array): MaybePromise<boolean>;

  sendResponse(context: TContext, payload: Uint8Array): MaybePromise<boolean>;

  subscribe(pattern: string, handler: BrokerMessageHandler<TContext>): MaybePromise<void>;
}

export function BrokerAdapter<TContext = unknown>(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<BrokerAdapter<TContext>> {
  return createExtensionDecorator(BrokerAdapter, options);
}
