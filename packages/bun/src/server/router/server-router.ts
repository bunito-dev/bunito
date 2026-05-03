import type { MaybePromise } from '@bunito/common';
import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';
import type { RequestContext, ServerWebSocket, WebSocketEvent } from '../types';

export interface ServerRouter {
  getRoutePaths?: () => MaybePromise<string[]>;
  processRequest: (
    request: Request,
    context: RequestContext,
  ) => MaybePromise<Response | undefined>;
  processWebSocketEvent?: (
    event: WebSocketEvent,
    socket: ServerWebSocket,
  ) => MaybePromise<false | undefined>;
}

export function ServerRouter(
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<ServerRouter> {
  return createExtensionDecorator(ServerRouter, options);
}
