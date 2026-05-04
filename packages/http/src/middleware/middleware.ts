import type { EmptyObject, MaybePromise, RawObject } from '@bunito/common';
import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createExtensionDecorator } from '@bunito/container/internals';
import type { HTTPException } from '../http.exception';
import type { MiddlewareContext } from './types';

export interface Middleware<TOptions extends RawObject = EmptyObject> {
  beforeRequest?(context: MiddlewareContext<TOptions>): MaybePromise;
  serializeResponseData?(
    responseData: unknown,
    context: MiddlewareContext<TOptions>,
  ): MaybePromise<Response | undefined>;
  serializeException?(
    exception: HTTPException,
    context: MiddlewareContext<TOptions>,
  ): MaybePromise<Response | undefined>;
}

export function Middleware<TOptions extends RawObject = EmptyObject>(
  options: Omit<ProviderDecoratorOptions, 'global'> = {},
): ExtensionDecorator<Middleware<TOptions>> {
  return createExtensionDecorator(Middleware, options);
}
