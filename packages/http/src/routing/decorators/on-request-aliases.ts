import type { OnRequestHandler, OnRequestSchema, RoutePath } from '../types';
import { OnRequest } from './on-request';

export const OnGet = <THandler extends OnRequestHandler>(
  path?: RoutePath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'GET', schema });

export const OnPost = <THandler extends OnRequestHandler>(
  path?: RoutePath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'POST', schema });

export const OnPut = <THandler extends OnRequestHandler>(
  path?: RoutePath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'PUT', schema });

export const OnDelete = <THandler extends OnRequestHandler>(
  path?: RoutePath,
  schema?: OnRequestSchema,
) => OnRequest<THandler>({ path, method: 'DELETE', schema });
