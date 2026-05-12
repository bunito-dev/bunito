import { defineConfig } from '@bunito/config';

export const NatsBrokerConfig = defineConfig(function NatsBroker({ getEnv }) {
  const servers = (getEnv('NATS_BROKER_SERVERS') ?? 'nats://localhost:4222').split(';');

  return {
    servers,
    queue: getEnv('NATS_BROKER_QUEUE') ?? 'default',
  };
});
