import { defineConfig } from '@bunito/config';

export const BrokerConfig = defineConfig(function Broker({ getEnv }) {
  return {
    adapter: getEnv('BROKER_ADAPTER', 'lowercase'),
  };
});
