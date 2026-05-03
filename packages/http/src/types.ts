import type { HTTPMethod } from '@bunito/bun';
import type { Class } from '@bunito/common';

export type { HTTPMethod };

export type HTTPPath = `/${string}`;

export type ControllerOptions = { prefix: HTTPPath };

export type RouteOptions = {
  path: HTTPPath;
  method?: HTTPMethod;
};

export type ControllerClassOptions =
  | {
      kind: 'prefix';
      prefix: HTTPPath;
    }
  | {
      kind: 'middleware';
      middleware: Class;
      options: unknown;
    };

export type ControllerMethodOptions = {
  kind: 'route';
  options: RouteOptions;
};
