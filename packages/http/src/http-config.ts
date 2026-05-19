import { defineConfig } from '@bunito/config';

export const HTTPConfig = defineConfig(function HTTP({ getEnv }) {
  return {
    defaultResponseContentType: getEnv?.('DEFAULT_RESPONSE_CONTENT_TYPE', 'lowercase'),
  };
});
