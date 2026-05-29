import { defineConfig } from '@bunito/config';

export const BunServerConfig = defineConfig<{
  port: number;
  hostname: string;
}>(function BunServer({ getEnv }) {
  return {
    port: getEnv?.(['SERVER_PORT', 'PORT'], 'port') ?? 3000,
    hostname: getEnv?.(['SERVER_HOSTNAME', 'HOSTNAME'], 'lowercase') ?? '0.0.0.0',
  };
});
