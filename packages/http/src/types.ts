import type { Class, StripUndefined } from '@bunito/common';
import type { ModuleId, ProviderId } from '@bunito/container';
import type { HttpMethod, HttpPath } from '@bunito/server';
import type { ZodType } from 'zod';
import type { Middleware } from './middleware';

declare global {
  namespace Bunito {
    interface ModuleOptionalProviders {
      controllers: import('@bunito/common').Class[];
      middleware: import('@bunito/common').Class<Middleware>[];
    }
  }
}

export type ControllerOptions = {
  prefix?: HttpPath;
  middleware?: Class<Middleware>[];
};

export type RouteOptions = {
  path?: HttpPath;
  method?: HttpMethod;
  uses?: Class<Middleware>[];
  injects?: unknown[];
};

export type RouteInjection = {
  token: unknown;
  schema?: ZodType;
};

export type RouteMiddleware = Required<{
  [TProp in keyof Middleware]: StripUndefined<Middleware[TProp]>[];
}>;

export type RouteDefinition = {
  middleware: RouteMiddleware;
  propKey: PropertyKey;
  providerId: ProviderId;
  moduleId: ModuleId;
  injects?: unknown[];
};
