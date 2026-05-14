import { afterEach, describe, expect, it } from 'bun:test';
import { restoreEnvs, setEnv } from '@bunito/common/testing';
import { ConfigService } from '@bunito/config';
import { HTTPConfig } from './http-config';

afterEach(() => {
  restoreEnvs('DEFAULT_RESPONSE_CONTENT_TYPE');
});

describe('HTTPRouterConfig', () => {
  it('resolves response content type from the environment', async () => {
    if (!('useFactory' in HTTPConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    setEnv('DEFAULT_RESPONSE_CONTENT_TYPE', 'TEXT/PLAIN');

    const config = await HTTPConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      defaultResponseContentType: 'text/plain',
    });
  });

  it('returns undefined content type by default', async () => {
    if (!('useFactory' in HTTPConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    restoreEnvs('DEFAULT_RESPONSE_CONTENT_TYPE');

    const config = await HTTPConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      defaultResponseContentType: undefined,
    });
  });
});
