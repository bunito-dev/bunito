import type { MaybePromise } from '@bunito/common';
import type { ExtensionDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import type { BunWebSocket, RequestContext, WebSocketEvent } from './types';

export interface BunServerRouter {
  getRoutePaths?: () => MaybePromise<string[]>;
  processRequest: (
    request: Request,
    context: RequestContext,
  ) => MaybePromise<Response | undefined>;
  processWebSocketEvent?: (
    event: WebSocketEvent,
    socket: BunWebSocket,
  ) => MaybePromise<false | undefined>;
}

export function BunServerRouter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<BunServerRouter> {
  return createExtensionDecorator(BunServerRouter, options);
}
