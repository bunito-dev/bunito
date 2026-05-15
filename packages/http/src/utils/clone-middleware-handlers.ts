import type { MiddlewareHandlers } from '../middleware';

export function cloneMiddlewareHandlers(
  handlers: MiddlewareHandlers | undefined,
): MiddlewareHandlers {
  return {
    beforeRequest: handlers?.beforeRequest ? [...handlers.beforeRequest] : [],
    beforeResponse: handlers?.beforeResponse ? [...handlers.beforeResponse] : [],
    serializeResponseData: handlers?.serializeResponseData
      ? [...handlers.serializeResponseData]
      : [],
    serializeException: handlers?.serializeException
      ? [...handlers.serializeException]
      : [],
  };
}
