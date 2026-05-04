import type { MiddlewareHandlers } from '../types';

export function cloneMiddlewareHandlers(
  handlers: MiddlewareHandlers | undefined,
): MiddlewareHandlers {
  return {
    beforeRequest: handlers?.beforeRequest ? [...handlers.beforeRequest] : [],
    serializeResponseData: handlers?.serializeResponseData
      ? [...handlers.serializeResponseData]
      : [],
    serializeException: handlers?.serializeException
      ? [...handlers.serializeException]
      : [],
  };
}
