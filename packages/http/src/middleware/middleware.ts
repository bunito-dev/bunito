import type { Class, MaybePromise } from '@bunito/common';
import type {
  ClassDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { Extension } from '@bunito/container/internals';
import type { HttpException, RequestContext } from '@bunito/server';
import { MIDDLEWARE_EXTENSION } from '../constants';

export interface Middleware<TOptions = unknown> {
  beforeRequest?: (context: RequestContext, options?: TOptions) => MaybePromise<void>;
  serializeResponseData?: (
    data: unknown,
    context: RequestContext,
    options?: TOptions,
  ) => MaybePromise<Response | undefined>;
  serializeException?: (
    exception: HttpException,
    context: RequestContext,
    options?: TOptions,
  ) => MaybePromise<Response | undefined>;
}

export function Middleware(
  options: ProviderDecoratorOptions = {},
): ClassDecorator<Class<Middleware<never>>> {
  return Extension('Middleware', MIDDLEWARE_EXTENSION, undefined, options);
}
