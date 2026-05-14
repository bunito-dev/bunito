import type { MiddlewareHandlers } from '../middleware';

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
