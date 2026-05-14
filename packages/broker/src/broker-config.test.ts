import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { BrokerConfig } from './broker-config';

describe('BrokerConfig', () => {
  it('reads the selected broker adapter from the environment', async () => {
    if (!('useFactory' in BrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    const config = await BrokerConfig.useFactory(
      new ConfigService(null, {
        BROKER_ADAPTER: 'LOCAL',
      }),
    );

    expect(config).toEqual({
      adapter: 'local',
    });
  });
});
