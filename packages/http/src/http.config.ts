import { registerConfig } from '@bunito/core';

export const httpConfig = registerConfig<{
  port: number | string;
}>('http', ({ getEnv }) => {
  return {
    port: getEnv('HTTP_PORT') ?? getEnv('PORT') ?? 3000,
  };
});
