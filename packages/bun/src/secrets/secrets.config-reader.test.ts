import { describe, expect, it } from 'bun:test';
import { ConfigReader } from '@bunito/config/internals';
import { getProviderMetadata } from '@bunito/container/internals';
import { SecretsConfigReader } from './secrets.config-reader';
import { SecretsService } from './secrets.service';

describe('SecretsConfigReader', () => {
  it('registers as a config reader and delegates secret lookup', async () => {
    const secretsService = {
      getSecret: async (key: string) => `secret:${key}`,
    } as unknown as SecretsService;
    const reader = new SecretsConfigReader(secretsService);

    const secret = await reader.getSecret('github.token');

    expect(secret).toBe('secret:github.token');
    expect(getProviderMetadata(SecretsConfigReader)).toEqual({
      decorator: ConfigReader,
      options: {
        injects: [SecretsService],
      },
    });
  });
});
