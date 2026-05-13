import { afterEach, describe, expect, it } from 'bun:test';
import { restoreEnvs, setEnv } from '@bunito/common/testing';
import { ConfigService } from '@bunito/config';
import { LocalBrokerConfig } from './local-broker-config';

describe('LocalBrokerConfig', () => {
  afterEach(() => {
    restoreEnvs(
      'LOCAL_BROKER_MODE',
      'LOCAL_BROKER_UID',
      'LOCAL_BROKER_TIMEOUT',
      'LOCAL_BROKER_DATA_DIR',
    );
  });

  it('reads local broker settings from the environment', async () => {
    setEnv('LOCAL_BROKER_MODE', 'FS');
    setEnv('LOCAL_BROKER_UID', 'worker-a');
    setEnv('LOCAL_BROKER_TIMEOUT', '500');
    setEnv('LOCAL_BROKER_DATA_DIR', '/tmp/broker');

    if (!('useFactory' in LocalBrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    const config = await LocalBrokerConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      mode: 'fs',
      uid: 'worker-a',
      timeout: 500,
      dataDir: '/tmp/broker',
    });
  });

  it('rejects unknown local broker modes', async () => {
    setEnv('LOCAL_BROKER_MODE', 'tcp');

    if (!('useFactory' in LocalBrokerConfig)) {
      throw new Error('Expected config factory provider');
    }

    let error: unknown;
    try {
      await LocalBrokerConfig.useFactory(new ConfigService());
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
