import { describe, expect, it } from 'bun:test';
import { PROCESS_ENV } from './constants';
import { restoreEnvs } from './restore-envs';
import { setEnv } from './set-env';

describe('restoreEnvs', () => {
  it('restores selected environment values to the initial snapshot', () => {
    setEnv('BUNITO_TEST_RESTORE', 'changed');

    restoreEnvs('BUNITO_TEST_RESTORE');

    expect(process.env.BUNITO_TEST_RESTORE).toBe(PROCESS_ENV.BUNITO_TEST_RESTORE);
  });

  it('restores all environment values when no keys are provided', () => {
    setEnv('BUNITO_TEST_RESTORE_ALL', 'changed');

    restoreEnvs();

    expect(process.env.BUNITO_TEST_RESTORE_ALL).toBe(PROCESS_ENV.BUNITO_TEST_RESTORE_ALL);
  });
});
