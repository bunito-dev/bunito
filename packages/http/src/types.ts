import type { HTTPMethod } from '@bunito/bun';
import type { Class, RawObject } from '@bunito/common';
import type { ModuleId, ProviderId, WithInjections } from '@bunito/container';
import type {
  HTTP_CONTENT_TYPES,
  HTTP_ERROR_STATUS_CODES,
  HTTP_HEADER_NAMES,
} from './constants';
import type { MiddlewareHandlers } from './middleware';

export type { HTTPMethod };

export type HTTPPath = `/${string}`;
export type HTTPErrorStatus = keyof typeof HTTP_ERROR_STATUS_CODES;
export type HTTPContentType = (typeof HTTP_CONTENT_TYPES)[number] | (string & {});
export type HTTPHeaderName = (typeof HTTP_HEADER_NAMES)[number] | (string & {});
export type HTTPParams = RawObject<string>;
export type HTTPQuery = RawObject<string | string[]>;

export type HTTPContext = {
  request: Request;
  url: URL;
  params: HTTPParams;
  query: HTTPQuery;
  body: unknown;
  data: RawObject;
};

export type ControllerDefinition = {
  moduleId: ModuleId;
  providerId: ProviderId;
  middleware: MiddlewareHandlers;
};

export type ControllerClassOptions =
  | {
      kind: 'middleware';
      middleware: Class;
      options: RawObject;
    }
  | {
      kind: 'cors';
      options: CORSOptions;
    };

export type ControllerMethodOptions = {
  kind: 'route';
  options: RouteOptions;
};

export type RouteMethod = Exclude<HTTPMethod, 'OPTIONS'> | 'ALL';

export type RouteOptions = WithInjections<{
  path: HTTPPath;
  method: RouteMethod;
}>;

export type RouteDefinition = WithInjections<{
  controller: ControllerDefinition;
  propKey: PropertyKey;
}>;

export type CORSOptions = {
  origin?: string | null;
  methods?: Exclude<HTTPMethod, 'OPTIONS'>[] | null;
  allowedHeaders?: string[] | null;
  credentials?: boolean | null;
  maxAge?: number | null;
};
