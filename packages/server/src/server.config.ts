import { defineConfig } from '@bunito/config';

export const ServerConfig = defineConfig<{
  port: number;
  hostname: string;
}>(
  'Server',
  {
    port: 4000,
    hostname: '0.0.0.0',
  },
  ({ getEnv }) => {
    return {
      port: getEnv(['SERVER_PORT', 'PORT'], 'port'),
      hostname: getEnv(['SERVER_HOSTNAME', 'HOSTNAME'], 'string'),
    };
  },
);
