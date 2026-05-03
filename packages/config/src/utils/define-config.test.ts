import { describe, expect, it } from 'bun:test';
import { ConfigException } from '../config.exception';
import { ConfigService } from '../config.service';
import { defineConfig } from './define-config';

describe('defineConfig', () => {
  it('rejects unnamed config definitions', () => {
    expect(() => defineConfig({} as never)).toThrow('Unnamed config detected');
  });

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
          useToken: ConfigService,
          optional: true,
        },
      ],
    });
    const result = await config.useFactory(new ConfigService());

    expect(result).toEqual({
      enabled: true,
    });
  });

  it('uses the builder function name when no explicit config name is provided', async () => {
    const config = defineConfig(function Feature() {
      return {
        enabled: true,
      };
    });

    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    const result = await config.useFactory(new ConfigService());

    expect(result).toEqual({
      enabled: true,
    });
  });

  it('returns defaults when a factory provider is resolved without ConfigService', async () => {
    const config = defineConfig(
      'Feature',
      async () => ({
        enabled: false,
        mode: undefined,
      }),
      {
        enabled: true,
        mode: 'safe',
      },
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
      async () => ({
        enabled: undefined,
        mode: 'strict',
      }),
      {
        enabled: true,
        mode: 'safe',
      },
    );

    expect('useFactory' in config).toBeTrue();
    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    const result = await config.useFactory(new ConfigService());

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

  it('adds config context to config exceptions thrown by builders', async () => {
    const config = defineConfig('Feature', () => {
      throw new ConfigException('Invalid value');
    });

    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    let error: unknown;
    try {
      await config.useFactory(new ConfigService());
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(ConfigException);
    expect((error as Error).message).toBe('Feature: Invalid value');
  });

  it('wraps non-config exceptions thrown by builders', async () => {
    const config = defineConfig('Feature', () => {
      throw new Error('Boom');
    });

    if (!('useFactory' in config)) {
      throw new Error('Expected config factory provider');
    }

    let error: unknown;
    try {
      await config.useFactory(new ConfigService());
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(ConfigException);
    expect((error as Error).message).toBe('Feature: Failed to build config');
    expect((error as Error).cause).toBeInstanceOf(Error);
  });
});
