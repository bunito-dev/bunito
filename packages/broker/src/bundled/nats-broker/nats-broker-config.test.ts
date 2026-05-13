import { afterEach, describe, expect, it } from 'bun:test';
import { restoreEnvs, setEnv } from '@bunito/common/testing';
import { ConfigService } from '@bunito/config';
import { NatsBrokerConfig } from './nats-broker-config';

describe('NatsBrokerConfig', () => {
  afterEach(() => {
    restoreEnvs('NATS_BROKER_SERVERS', 'NATS_BROKER_QUEUE');
  });

  it('reads NATS broker settings from the environment', async () => {
    setEnv('NATS_BROKER_SERVERS', 'nats://a:4222;nats://b:4222');
    setEnv('NATS_BROKER_QUEUE', 'workers');

    if (!('useFactory' in NatsBrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    const config = await NatsBrokerConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      servers: ['nats://a:4222', 'nats://b:4222'],
      queue: 'workers',
    });
  });
});
