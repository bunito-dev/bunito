import { describe, expect, it } from 'bun:test';
import { CONFIG_ENVS_ID } from '../constants';
import { overwriteConfigEnvs } from './overwrite-config-envs';

describe('overwriteConfigEnvs', () => {
  it('overwrites envs while preserving all existing values by default', () => {
    process.env.BUNITO_TEST_ENV = 'existing';

    const provider = overwriteConfigEnvs({
      BUNITO_TEST_ENV: 'overwritten',
      EXTRA: 'value',
    });

    expect(provider.token).toBe(CONFIG_ENVS_ID);
    expect(provider.global).toBeTrue();
    expect(provider.useValue).toMatchObject({
      BUNITO_TEST_ENV: 'overwritten',
      EXTRA: 'value',
    });
  });

  it('can exclude existing envs or preserve selected existing names', () => {
    process.env.BUNITO_KEEP_ENV = 'keep';

    expect(overwriteConfigEnvs({ ONLY: 'new' }, false).useValue).toEqual({
      ONLY: 'new',
    });
    expect(overwriteConfigEnvs({ ONLY: 'new' }, 'BUNITO_KEEP_ENV').useValue).toEqual({
      BUNITO_KEEP_ENV: 'keep',
      ONLY: 'new',
    });
  });
});
