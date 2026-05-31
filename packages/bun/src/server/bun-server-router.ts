import type { MaybePromise } from '@bunito/common';
import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { BunWebSocket } from './bun-websocket';
import type { BunRequestContext, BunWebSocketEvent } from './types';

export interface BunServerRouter {
  getRoutePaths?: () => MaybePromise<string[]>;
  processRequest: (
    request: Request,
    context: BunRequestContext,
  ) => MaybePromise<Response | undefined>;
  processWebSocketEvent?: (
    event: BunWebSocketEvent,
    socket: BunWebSocket,
  ) => MaybePromise<false | undefined>;
}

export function BunServerRouter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<BunServerRouter> {
  return createExtensionDecorator(BunServerRouter, options);
}
