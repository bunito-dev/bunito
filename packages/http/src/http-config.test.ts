import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { HTTPConfig } from './http-config';

describe('HTTPRouterConfig', () => {
  it('resolves response content type from the environment', async () => {
    if (!('useFactory' in HTTPConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    const config = await HTTPConfig.useFactory(
      new ConfigService(null, {
        DEFAULT_RESPONSE_CONTENT_TYPE: 'TEXT/PLAIN',
      }),
    );

    expect(config).toEqual({
      defaultResponseContentType: 'text/plain',
    });
  });

  it('returns undefined content type by default', async () => {
    if (!('useFactory' in HTTPConfig)) {
      throw new Error('Expected HTTPRouterConfig factory provider');
    }

    const config = await HTTPConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      defaultResponseContentType: undefined,
    });
  });
});
