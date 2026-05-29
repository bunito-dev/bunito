import { describe, expect, it } from 'bun:test';
import { ConfigReader } from '@bunito/config';
import { getClassMetadata } from '@bunito/container';
import { BunSecretsConfigReader } from './bun-secrets.config-reader';
import { BunSecretsService } from './bun-secrets.service';

describe('SecretsConfigReader', () => {
  it('registers as a config reader and delegates secret lookup', async () => {
    const secretsService = {
      getSecret: async (key: string) => `secret:${key}`,
    } as unknown as BunSecretsService;
    const reader = new BunSecretsConfigReader(secretsService);

    const secret = await reader.getSecret('github.token');

    expect(secret).toBe('secret:github.token');
    expect(getClassMetadata(BunSecretsConfigReader, 'provider')).toEqual({
      decorator: ConfigReader,
      options: {
        injects: [BunSecretsService],
      },
    });
  });
});
