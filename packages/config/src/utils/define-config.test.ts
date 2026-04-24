import { describe, expect, it } from 'bun:test';
import { ConfigService } from '../config.service';
import { defineConfig } from './define-config';

describe('defineConfig', () => {
  it('creates a singleton async config provider definition', async () => {
    const config = defineConfig('Feature', () => ({ enabled: true }));

    expect('useFactory' in config).toBeTrue();
    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    expect(config).toEqual({
      token: expect.any(Symbol),
      useFactory: expect.any(Function),
      scope: 'singleton',
      injects: [
        {
          token: ConfigService,
          optional: true,
        },
      ],
    });
    const result = await config.useFactory({
      getEnv: () => undefined,
    } as never);

    expect(result).toEqual({
      enabled: true,
    });
  });

  it('returns defaults when a factory provider is resolved without ConfigService', async () => {
    const config = defineConfig(
      'Feature',
      {
        enabled: true,
        mode: 'safe',
      },
      async () => ({
        enabled: false,
        mode: undefined,
      }),
    );

    expect('useFactory' in config).toBeTrue();
    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    const result = await config.useFactory(undefined);

    expect(result).toEqual({
      enabled: true,
      mode: 'safe',
    });
  });

  it('merges undefined factory fields with default config values', async () => {
    const config = defineConfig(
      'Feature',
      {
        enabled: true,
        mode: 'safe',
      },
      async () => ({
        enabled: undefined,
        mode: 'strict',
      }),
    );

    expect('useFactory' in config).toBeTrue();
    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    const result = await config.useFactory({
      getEnv: () => undefined,
    } as never);

    expect(result).toEqual({
      enabled: true,
      mode: 'strict',
    });
  });

  it('creates a value config provider when only defaults are provided', () => {
    const config = defineConfig('Feature', {
      enabled: true,
    });

    expect(config).toEqual({
      token: expect.any(Symbol),
      useValue: {
        enabled: true,
      },
    });
  });
});
