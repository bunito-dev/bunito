import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config/internals';
import { HTTPConfig } from './http-config';

const originalEnv = { ...process.env };

afterEach(() => {
  const value = originalEnv.RESPONSE_CONTENT_TYPE;

  if (value === undefined) {
    delete process.env.RESPONSE_CONTENT_TYPE;
    return;
  }

  process.env.RESPONSE_CONTENT_TYPE = value;
});

describe('HTTPRouterConfig', () => {
  it('resolves response content type from the environment', async () => {
    if (!('useFactory' in HTTPConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    process.env.RESPONSE_CONTENT_TYPE = 'TEXT/PLAIN';

    const config = await HTTPConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      defaultResponseContentType: 'text/plain',
    });
  });

  it('returns undefined content type by default', async () => {
    if (!('useFactory' in HTTPConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    delete process.env.RESPONSE_CONTENT_TYPE;

    const config = await HTTPConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      defaultResponseContentType: undefined,
    });
  });
});
