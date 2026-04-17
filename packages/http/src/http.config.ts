import { defineConfig } from '@bunito/config';
import { HTTP_CONTENT_TYPES } from './constants';
import type { HttpContentType } from './types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_REQUEST_CONTENT_TYPE?: string;
      DEFAULT_RESPONSE_CONTENT_TYPE?: string;
    }
  }
}

export const HttpConfig = defineConfig<{
  defaultRequestContentType: HttpContentType;
  defaultResponseContentType: HttpContentType;
}>('Http', ({ getEnv }) => {
  return {
    defaultRequestContentType:
      getEnv('DEFAULT_REQUEST_CONTENT_TYPE', 'string', HTTP_CONTENT_TYPES) ??
      'application/json',
    defaultResponseContentType:
      getEnv('DEFAULT_RESPONSE_CONTENT_TYPE', 'string', HTTP_CONTENT_TYPES) ??
      'application/json',
  };
});
