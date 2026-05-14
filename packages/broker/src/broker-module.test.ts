import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getClassMetadata } from '@bunito/container';
import { BrokerConfig } from './broker-config';
import { BrokerModule } from './broker-module';
import { BrokerService } from './broker-service';

describe('BrokerModule', () => {
  it('registers broker config and service providers', () => {
    expect(getClassMetadata(BrokerModule, 'module')).toEqual({
      imports: [ConfigModule],
      configs: [BrokerConfig],
      providers: [BrokerService],
      exports: [BrokerService],
    });
  });
});
