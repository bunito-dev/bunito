import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { NatsBrokerConfig } from './nats-broker-config';

describe('NatsBrokerConfig', () => {
  it('reads NATS broker settings from the environment', async () => {
    if (!('useFactory' in NatsBrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    const config = await NatsBrokerConfig.useFactory(
      new ConfigService(null, {
        NATS_BROKER_SERVERS: 'nats://a:4222;nats://b:4222',
        NATS_BROKER_QUEUE: 'workers',
      }),
    );

    expect(config).toEqual({
      servers: ['nats://a:4222', 'nats://b:4222'],
      queue: 'workers',
    });
  });
});
