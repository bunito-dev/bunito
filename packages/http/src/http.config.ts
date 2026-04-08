import { defineConfig } from '@bunito/core';

export const HttpConfig = defineConfig<{
  port: number | string;
}>('HttpConfig', ({ getEnvAs }) => {
  return {
    port: getEnvAs(['HTTP_PORT', 'PORT'], 'port') ?? 3000,
  };
});
