import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { Id } from '@bunito/container';
import { ConfigService } from './config.service';
import { CONFIG_EXTENSION } from './constants';

describe('ConfigService', () => {
  it('reads environment values through formats and parsers', () => {
    const previousEnv = { ...process.env };

    process.env.CI = 'true';
    process.env.PORT = ' 3000 ';
    process.env.LOG_LEVEL = 'debug';
    process.env.FALLBACK = 'fallback';
    process.env.JSON_VALUE = '{"ok":true}';

    const service = new ConfigService({} as never);

    expect(service.isCI).toBe(true);
    expect(service.getEnv('PORT')).toBe('3000');
    expect(service.getEnv('PORT', 'port')).toBe(3000);
    expect(service.getEnv('LOG_LEVEL', 'toUpperCase', ['DEBUG'])).toBe('DEBUG');
    expect(service.getEnv(['MISSING', 'FALLBACK'], 'string')).toBe('fallback');
    expect(
      service.getEnv(
        'JSON_VALUE',
        (value) => JSON.parse(value as string) as { ok: boolean },
      ),
    ).toEqual({ ok: true });
    expect(
      service.getEnv('PORT', {
        safeParse: (data) =>
          data === '3000'
            ? { success: true as const, data: 3000 }
            : { success: false as const },
      }),
    ).toBe(3000);
    expect(
      service.getEnv('PORT', {
        safeParse: () => ({ success: false as const }),
      }),
    ).toBeUndefined();
    expect(service.getEnv('UNKNOWN')).toBeUndefined();

    process.env = previousEnv;
  });

  it('configures extensions and reads secrets through them', async () => {
    const extensions = [
      {
        getSecret: async (key: string) =>
          key === 'service.token' ? 'secret-value' : undefined,
      },
      {
        getSecret: async (key: string) =>
          key === 'fallback.token' ? 'second-value' : undefined,
      },
    ];
    const providerMap = new Map<unknown, (typeof extensions)[number]>();
    const container = {
      getExtensions: (key: symbol) =>
        key === CONFIG_EXTENSION
          ? extensions.map((extension, index) => {
              const providerId = Id.for(`extension-${index}`);

              providerMap.set(providerId, extension);

              return {
                providerId,
                moduleId: Id.unique('Module'),
              };
            })
          : [],
      resolveProvider: async (providerId: unknown) => providerMap.get(providerId),
    };
    const service = new ConfigService(container as never);

    await service.configure();

    expect(await service.getSecret('service.token')).toBe('secret-value');
    expect(await service.getSecret(['missing', 'fallback.token'])).toBe('second-value');
    expect(await service.getSecret('missing')).toBeUndefined();
    expect(await service.getSecret('service.token', 'toUpperCase')).toBe('SECRET-VALUE');
  });

  it('rejects invalid config extensions', async () => {
    const service = new ConfigService({
      getExtensions: () => [
        {
          providerId: Id.for('bad-extension'),
          moduleId: Id.unique('Module'),
        },
      ],
      resolveProvider: async () => ({}),
    } as never);

    await expect(service.configure()).rejects.toThrow(ConfigurationException);
  });
});
