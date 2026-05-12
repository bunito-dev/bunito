import type { MaybePromise } from '@bunito/common';
import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';
import type { MessageHandler } from './types';

export interface BrokerAdapter<TContext = unknown> {
  readonly NAME: string;

  connect?: () => Promise<void>;

  disconnect?: () => MaybePromise<void>;

  sendRequest(topic: string, data: unknown): MaybePromise;

  sendEvent(topic: string, data: unknown): MaybePromise<boolean>;

  sendResponse(context: TContext, data: unknown): MaybePromise<boolean>;

  subscribe(pattern: string, handler: MessageHandler<TContext>): MaybePromise<void>;
}

export function BrokerAdapter<TContext = unknown>(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<BrokerAdapter<TContext>> {
  return createExtensionDecorator(BrokerAdapter, options);
}
