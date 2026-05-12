import { defineConfig } from '@bunito/config';
import type { HTTPContentType } from './types';

export const HTTPConfig = defineConfig<{
  defaultResponseContentType?: HTTPContentType;
}>('HTTP', ({ getEnv }) => ({
  defaultResponseContentType: getEnv('DEFAULT_RESPONSE_CONTENT_TYPE', 'lowercase'),
}));
