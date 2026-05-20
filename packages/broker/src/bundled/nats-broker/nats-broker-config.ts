import { defineConfig } from '@bunito/config';

export const NatsBrokerConfig = defineConfig(function NatsBroker(context) {
  const servers = (
    context.getEnv?.('NATS_BROKER_SERVERS') ?? 'nats://localhost:4222'
  ).split(';');

  return {
    servers,
    queue: context.getEnv?.('NATS_BROKER_QUEUE') ?? 'default',
  };
});
