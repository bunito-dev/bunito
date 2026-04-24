import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { CONFIG_EXTENSION } from '@bunito/config/internals';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { secrets } from 'bun';

describe('BunSecretsExtension', () => {
  afterEach(() => {
    mock.restore();
  });

  it('delegates get, set, and delete operations to bun secrets', async () => {
    const calls: unknown[] = [];

    const getSpy = spyOn(secrets, 'get').mockImplementation(async (options) => {
      calls.push(['get', options]);
      return 'value';
    });
    const setSpy = spyOn(secrets, 'set').mockImplementation(async (options) => {
      calls.push(['set', options]);
    });
    const deleteSpy = spyOn(secrets, 'delete').mockImplementation(async (options) => {
      calls.push(['delete', options]);
      return true;
    });

    try {
      const { BunSecretsExtension } = await import('./bun-secrets.extension');
      const extension = new BunSecretsExtension();

      expect(await extension.getSecret('github.token')).toBe('value');
      expect(await extension.getSecret('invalid' as never)).toBeUndefined();

      await extension.setSecret('github.token', 'secret', {
        allowUnrestrictedAccess: true,
      });

      expect(await extension.deleteSecret('github.token')).toBeTrue();
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
            allowUnrestrictedAccess: true,
            value: 'secret',
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
    } finally {
      getSpy.mockRestore();
      setSpy.mockRestore();
      deleteSpy.mockRestore();
    }
  });

  it('registers as a singleton config extension', async () => {
    const { BunSecretsExtension } = await import('./bun-secrets.extension');

    expect(getDecoratorMetadata(BunSecretsExtension, 'extension')).toEqual({
      key: CONFIG_EXTENSION,
      options: undefined,
    });
    expect(getDecoratorMetadata(BunSecretsExtension, 'provider')).toEqual({
      options: {
        scope: 'singleton',
      },
    });
  });
});
