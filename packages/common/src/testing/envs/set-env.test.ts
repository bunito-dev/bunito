import { afterEach, describe, expect, it } from 'bun:test';
import { restoreEnvs } from './restore-envs';
import { setEnv } from './set-env';

describe('setEnv', () => {
  afterEach(() => {
    restoreEnvs('BUNITO_TEST_ENV');
  });

  it('sets process environment values for tests', () => {
    setEnv('BUNITO_TEST_ENV', 'enabled');

    expect(process.env.BUNITO_TEST_ENV).toBe('enabled');
  });
});
