import type { Class } from '@bunito/common';
import type { ModuleId, ProviderId } from '@bunito/container';
import type { HttpMethod, HttpPath } from '@bunito/server';
import type { Middleware } from './middleware';

declare global {
  namespace Bunito {
    interface ModuleOptionalProviders {
      controllers: import('@bunito/common').Class[];
    }
  }
}

export type ControllerOptions =
  | {
      kind: 'prefix';
      prefix: HttpPath;
    }
  | {
      kind: 'middleware';
      middleware: Class<Middleware>;
      options?: unknown;
    };

export type RouteOptions = {
  path?: HttpPath;
  method?: HttpMethod;
  injects?: unknown[];
};

export type RouteMiddleware = Required<{
  [TProp in keyof Middleware]: {
    handler: Exclude<Middleware[TProp], undefined>;
    options?: unknown;
  }[];
}>;

export type RouteDefinition = {
  middleware: RouteMiddleware;
  propKey: PropertyKey;
  providerId: ProviderId;
  moduleId: ModuleId;
  injects?: unknown[];
};
