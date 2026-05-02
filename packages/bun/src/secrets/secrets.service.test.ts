import { afterEach, describe, expect, it } from 'bun:test';
import { SecretsService } from './secrets.service';

const originalSecrets = Bun.secrets;

const writableBun = Bun as unknown as { secrets: typeof Bun.secrets };

afterEach(() => {
  writableBun.secrets = originalSecrets;
});

describe('SecretsService', () => {
  it('gets, sets, and deletes Bun secrets with parsed service and name', async () => {
    const calls: unknown[] = [];
    writableBun.secrets = {
      get: async (options: unknown) => {
        calls.push(['get', options]);
        return 'secret-value';
      },
      set: async (options: unknown) => {
        calls.push(['set', options]);
      },
      delete: async (options: unknown) => {
        calls.push(['delete', options]);
        return true;
      },
    } as typeof Bun.secrets;
    const secretsService = new SecretsService();

    const secret = await secretsService.getSecret('github.token');
    await secretsService.setSecret('github.token', 'new-value', {
      allowUnrestrictedAccess: true,
    });
    const deleted = await secretsService.deleteSecret('github.token');

    expect(secret).toBe('secret-value');
    expect(deleted).toBeTrue();
    expect(calls).toEqual([
      [
        'get',
        {
          service: 'github',
          name: 'token',
        },
      ],
      [
        'set',
        {
          service: 'github',
          name: 'token',
          value: 'new-value',
          allowUnrestrictedAccess: true,
        },
      ],
      [
        'delete',
        {
          service: 'github',
          name: 'token',
        },
      ],
    ]);
  });
});
