import type { Class } from '@bunito/common';
import type { ModuleId } from '@bunito/core';
import type { z } from 'zod';
import type { HTTP_STATUS_MESSAGES } from './constants';

export type HttpPath = `/${string}`;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type HttpStatus = keyof typeof HTTP_STATUS_MESSAGES;

export type HttpHandlerSchema = {
  params?: z.ZodObject;
  query?: z.ZodObject;
  body?: z.ZodObject;
};

export type HttpHandlerOptions = {
  name: PropertyKey;
  path: HttpPath;
  method: HttpMethod;
  schema?: HttpHandlerSchema;
};

export type ResolveHttpContext<TField> = TField extends z.ZodObject
  ? z.infer<TField>
  : TField;

export type HttpContext<
  TFields extends {
    params?: unknown;
    query?: unknown;
    body?: unknown;
    data?: Record<string, unknown>;
  } = {
    params?: unknown;
    query?: unknown;
    body?: unknown;
    data?: Record<string, unknown>;
  },
> = {
  request: Request;
  url: URL;
  path: HttpPath;
  params: ResolveHttpContext<TFields['params']>;
  query: ResolveHttpContext<TFields['query']>;
  body: ResolveHttpContext<TFields['body']>;
  data: TFields['data'] extends undefined ? Record<string, unknown> : TFields['data'];
};

export type HttpRequest = Request & { params?: unknown };

export type HttpRoute = (request: HttpRequest) => Promise<Response>;

export type HttpHandlerDefinition = {
  moduleId: ModuleId;
  targetClass: Class;
  options: HttpHandlerOptions;
};
