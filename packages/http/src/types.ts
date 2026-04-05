import type { HTTP_ERROR_STATUS_CODES, HTTP_SUCCESS_STATUS_CODES } from './constants';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'ALL';

export type HttpErrorStatus = keyof typeof HTTP_ERROR_STATUS_CODES;

export type HttpSuccessStatus = keyof typeof HTTP_SUCCESS_STATUS_CODES;

export type HttpStatus = HttpErrorStatus | HttpSuccessStatus;

export type HttpContext = {
  request: Request;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  body: unknown;
  data: Record<string, unknown>;
};
