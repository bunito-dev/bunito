import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { LocalBrokerConfig } from './local-broker-config';

describe('LocalBrokerConfig', () => {
  it('reads local broker settings from the environment', async () => {
    if (!('useFactory' in LocalBrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    const config = await LocalBrokerConfig.useFactory(
      new ConfigService(null, {
        LOCAL_BROKER_MODE: 'FS',
        LOCAL_BROKER_UID: 'worker-a',
        LOCAL_BROKER_TIMEOUT: '500',
        LOCAL_BROKER_DATA_DIR: '/tmp/broker',
      }),
    );

    expect(config).toEqual({
      mode: 'fs',
      uid: 'worker-a',
      timeout: 500,
      dataDir: '/tmp/broker',
    });
  });

  it('rejects unknown local broker modes', async () => {
    if (!('useFactory' in LocalBrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    let error: unknown;
    try {
      await LocalBrokerConfig.useFactory(
        new ConfigService(null, {
          LOCAL_BROKER_MODE: 'tcp',
        }),
      );
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'LocalBroker: Failed to process config LOCAL_BROKER_MODE env',
    );
    expect((error as Error).cause).toBeInstanceOf(Error);
  });
});
