import type { Class, MaybePromise } from '@bunito/common';
import type { ClassDecorator, ProviderDecoratorOptions } from '@bunito/container';
import { Extension } from '@bunito/container';
import type { HttpException, RequestContext } from '@bunito/server';
import { MIDDLEWARE_EXTENSION } from '../constants';

export interface Middleware {
  beforeRequest?: (context: RequestContext) => MaybePromise<void>;
  serializeResponseData?: (
    data: unknown,
    context: RequestContext,
  ) => MaybePromise<Response | undefined>;
  serializeException?: (
    exception: HttpException,
    context: RequestContext,
  ) => MaybePromise<Response | undefined>;
}

export function Middleware<TMiddleware extends Class<TMiddleware>>(
  options: ProviderDecoratorOptions = {},
): ClassDecorator<TMiddleware> {
  return Extension('Middleware', MIDDLEWARE_EXTENSION, undefined, options);
}
