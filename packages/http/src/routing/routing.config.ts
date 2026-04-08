import { defineConfig } from '@bunito/core';
import { HTTP_CONTENT_TYPES } from '../constants';
import type { HttpContentType } from '../types';

export const RoutingConfig = defineConfig<{
  defaultContentType: HttpContentType;
}>('RoutingConfig', ({ getEnvAs }) => {
  return {
    defaultContentType:
      getEnvAs('DEFAULT_CONTENT_TYPE', 'string', HTTP_CONTENT_TYPES) ??
      'application/json',
  };
});
