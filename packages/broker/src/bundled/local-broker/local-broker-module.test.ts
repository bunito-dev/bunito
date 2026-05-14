import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getClassMetadata } from '@bunito/container';
import { LocalBroker } from './local-broker';
import { LocalBrokerConfig } from './local-broker-config';
import { LocalBrokerModule } from './local-broker-module';

describe('LocalBrokerModule', () => {
  it('registers the local broker adapter and config', () => {
    expect(getClassMetadata(LocalBrokerModule, 'module')).toEqual({
      imports: [ConfigModule],
      configs: [LocalBrokerConfig],
      extensions: [LocalBroker],
    });
  });
});
