import type { HTTP_ERROR_STATUS_CODES, HTTP_SUCCESS_STATUS_CODES } from './constants';

export type HttpPath = `/${string}`;

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

export type BaseRouteOptions = {
  method?: HttpMethod;
  path?: HttpPath;
};

export type RequestRouteOptions = BaseRouteOptions;

export type RequestRouteOptionsLike = Omit<RequestRouteOptions, 'method'> | HttpPath;

export type RequestRouteDefinition = {
  propKey: PropertyKey;
  options: Required<RequestRouteOptions>;
};

export type ResponseRouteOptions = BaseRouteOptions;

export type ResponseRouteDefinition = {
  propKey: PropertyKey;
  options: Required<ResponseRouteOptions>;
};
