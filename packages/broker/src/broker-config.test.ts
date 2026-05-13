import { afterEach, describe, expect, it } from 'bun:test';
import { restoreEnvs, setEnv } from '@bunito/common/testing';
import { ConfigService } from '@bunito/config';
import { BrokerConfig } from './broker-config';

describe('BrokerConfig', () => {
  afterEach(() => {
    restoreEnvs('BROKER_ADAPTER');
  });

  it('reads the selected broker adapter from the environment', async () => {
    setEnv('BROKER_ADAPTER', 'LOCAL');

    if (!('useFactory' in BrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    const config = await BrokerConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      adapter: 'local',
    });
  });
});
