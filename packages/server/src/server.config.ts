import { defineConfig } from '@bunito/config';

export const ServerConfig = defineConfig<{
  port: number;
  hostname: string;
}>('Server', ({ getEnv }) => {
  return {
    port: getEnv(['SERVER_PORT', 'PORT'], 'port') ?? 4000,
    hostname: getEnv(['SERVER_HOSTNAME', 'HOSTNAME'], 'string') ?? '0.0.0.0',
  };
});
