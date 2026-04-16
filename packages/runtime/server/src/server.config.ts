import { defineConfig } from '@bunito/config';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      HOSTNAME?: string;
      SERVER_PORT?: string;
      SERVER_HOSTNAME?: string;
    }
  }
}

export const ServerConfig = defineConfig<{
  port: number;
  hostname: string;
}>('Server', ({ getEnv }) => {
  return {
    port: getEnv(['SERVER_PORT', 'PORT'], 'port') ?? 4000,
    hostname: getEnv(['SERVER_HOSTNAME', 'HOSTNAME'], 'string') ?? '0.0.0.0',
  };
});
