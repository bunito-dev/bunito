import type { RawObject } from '@bunito/common';
import type { Middleware, MiddlewareHandlers } from '../middleware';

export function pushMiddlewareHandlers(
  handlers: MiddlewareHandlers,
  instance: Middleware,
  options: RawObject,
): void {
  if (instance.beforeRequest) {
    handlers.beforeRequest.push({
      handler: instance.beforeRequest,
      options,
    });
  }

  if (instance.serializeResponseData) {
    handlers.serializeResponseData.push({
      handler: instance.serializeResponseData,
      options,
    });
  }

  if (instance.serializeException) {
    handlers.serializeException.push({
      handler: instance.serializeException,
      options,
    });
  }
}
