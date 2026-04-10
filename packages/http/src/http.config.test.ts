import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/core';
import { HttpConfig } from './http.config';

describe('HttpConfig', () => {
  it('should default to port 3000', async () => {
    expect(await HttpConfig.useFactory(new ConfigService())).toEqual({
      port: 3000,
    });
  });

  it('should prefer configured ports from env lookups', async () => {
    const service = {
      getEnvAs(keys: string[]) {
        return keys.join(',') === 'HTTP_PORT,PORT' ? 8080 : undefined;
      },
    } as unknown as ConfigService;

    expect(await HttpConfig.useFactory(service)).toEqual({
      port: 8080,
    });
  });
});
