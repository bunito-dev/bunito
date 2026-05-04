import type { HTTPMethod } from '@bunito/bun';
import type { Class, RawObject } from '@bunito/common';
import type { ModuleId, ProviderId } from '@bunito/container';
import type { WithInjections } from '@bunito/container/internals';
import type { HTTP_CONTENT_TYPES, HTTP_ERROR_STATUS_CODES } from './constants';
import type { MiddlewareHandlers } from './middleware';

export type { HTTPMethod };

export type HTTPPath = `/${string}`;

export type HTTPErrorStatus = keyof typeof HTTP_ERROR_STATUS_CODES;

export type HTTPContentType = (typeof HTTP_CONTENT_TYPES)[number] | (string & {});

export type HTTPParams = RawObject<string>;

export type HTTPQuery = RawObject<string | string[]>;

export type HTTPContext = {
  request: Request;
  url: URL;
  params: HTTPParams;
  query: HTTPQuery;
  body: unknown;
};

export type ControllerOptions = {
  prefix: HTTPPath;
};

export type ControllerDefinition = {
  moduleId: ModuleId;
  providerId: ProviderId;
  middleware: MiddlewareHandlers;
};

export type RouteMethod = HTTPMethod | 'ALL';

export type RouteOptions = WithInjections<{
  path: HTTPPath;
  method: RouteMethod;
}>;

export type RouteDefinition = WithInjections<{
  controller: ControllerDefinition;
  propKey: PropertyKey;
}>;

// controller component

export type ControllerClassOptions =
  | {
      kind: 'prefix';
      prefix: HTTPPath;
    }
  | {
      kind: 'middleware';
      middleware: Class;
      options: RawObject;
    };

export type ControllerMethodOptions = {
  kind: 'route';
  options: RouteOptions;
};
