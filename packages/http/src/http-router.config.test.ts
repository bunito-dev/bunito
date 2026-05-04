import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config/internals';
import { HTTPRouterConfig } from './http-router.config';

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
    if (!('useFactory' in HTTPRouterConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    process.env.RESPONSE_CONTENT_TYPE = 'TEXT/PLAIN';

    const config = await HTTPRouterConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      responseContentType: 'text/plain',
    });
  });

  it('returns undefined content type by default', async () => {
    if (!('useFactory' in HTTPRouterConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    delete process.env.RESPONSE_CONTENT_TYPE;

    const config = await HTTPRouterConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      responseContentType: undefined,
    });
  });
});
