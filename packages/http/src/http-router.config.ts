import { defineConfig } from '@bunito/config';
import type { HTTPContentType } from './types';

export const HTTPRouterConfig = defineConfig<{
  responseContentType?: HTTPContentType;
}>('HttpRouter', ({ getEnv }) => ({
  responseContentType: getEnv('RESPONSE_CONTENT_TYPE', 'lowercase'),
}));
