import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getClassMetadata } from '@bunito/container';
import { NatsBroker } from './nats-broker';
import { NatsBrokerConfig } from './nats-broker-config';
import { NatsBrokerModule } from './nats-broker-module';

describe('NatsBrokerModule', () => {
  it('registers the NATS broker adapter and config', () => {
    expect(getClassMetadata(NatsBrokerModule, 'module')).toEqual({
      imports: [ConfigModule],
      configs: [NatsBrokerConfig],
      extensions: [NatsBroker],
    });
  });
});
