import { defineConfig } from '@bunito/config';
import { HTTP_CONTENT_TYPES } from './constants';
import type { HttpContentType } from './types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_CONTENT_TYPE?: string;
    }
  }
}

export const HttpConfig = defineConfig<{
  defaultContentType: HttpContentType;
}>('Http', ({ getEnv }) => {
  return {
    defaultContentType:
      getEnv('DEFAULT_CONTENT_TYPE', 'string', HTTP_CONTENT_TYPES) ?? 'application/json',
  };
});
