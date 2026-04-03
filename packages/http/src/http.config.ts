import { defineConfig } from '@bunito/core';

export const HttpConfig = defineConfig<{
  port: number | string;
}>('http', ({ getEnv }) => {
  return {
    port: getEnv('HTTP_PORT') ?? getEnv('PORT') ?? 3000,
  };
});
