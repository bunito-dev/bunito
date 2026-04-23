import type { Class, MaybePromise } from '@bunito/common';
import type {
  ClassDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { Extension } from '@bunito/container/internals';
import { SERVER_EXTENSION } from './constants';
import type { RequestHandler, ServerRouteOptions, WebSocketHandler } from './types';

export interface ServerExtension {
  getRoutes?(): MaybePromise<ServerRouteOptions[]>;
  processRequest: RequestHandler;
  processWebSocketEvent?: WebSocketHandler;
}

export function ServerExtension(
  options: ProviderDecoratorOptions<'scope' | 'global' | 'token'> = {},
): ClassDecorator<Class<ServerExtension>> {
  return Extension('ServerExtension', SERVER_EXTENSION, undefined, {
    scope: 'singleton',
    ...options,
  });
}
