import { defineConfig } from '@bunito/core';
import { HTTP_CONTENT_TYPES } from './constants';
import type { HttpContentType } from './types';

export const HttpConfig = defineConfig<{
  defaultContentType: HttpContentType;
}>('Http', ({ getEnv }) => {
  return {
    defaultContentType:
      getEnv('DEFAULT_CONTENT_TYPE', 'string', HTTP_CONTENT_TYPES) ?? 'application/json',
  };
});
