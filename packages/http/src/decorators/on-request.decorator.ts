import type { ClassMethodDecorator } from '@bunito/common';
import { createComponentMethodDecorator } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import type {
  ControllerMethodOptions,
  HttpPath,
  OnRequestHandler,
  OnRequestOptions,
  OnRequestSchema,
} from '../types';

export function OnRequest<THandler extends OnRequestHandler>(
  options: OnRequestOptions = {},
): ClassMethodDecorator<THandler> {
  return createComponentMethodDecorator<ControllerMethodOptions, THandler>(
    HTTP_CONTROLLER,
    {
      kind: 'onRequest',
      path: '/',
      method: 'ALL',
      schema: null,
      ...options,
    },
  );
}

// aliases

export const OnGet = <THandler extends OnRequestHandler>(
  path?: HttpPath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'GET', schema });

export const OnPost = <THandler extends OnRequestHandler>(
  path?: HttpPath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'POST', schema });

export const OnPut = <THandler extends OnRequestHandler>(
  path?: HttpPath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'PUT', schema });

export const OnDelete = <THandler extends OnRequestHandler>(
  path?: HttpPath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'DELETE', schema });
