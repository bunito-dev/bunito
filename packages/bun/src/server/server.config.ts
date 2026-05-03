import { defineConfig } from '@bunito/config';

export const ServerConfig = defineConfig(function Server({ getEnv }) {
  return {
    port: getEnv(['SERVER_PORT', 'PORT'], 'port') ?? 3000,
    hostname: getEnv(['SERVER_HOSTNAME', 'HOSTNAME'], 'lowercase') ?? '0.0.0.0',
  };
});
