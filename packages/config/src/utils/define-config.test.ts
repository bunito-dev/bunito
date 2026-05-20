import { describe, expect, it } from 'bun:test';
import { InternalException } from '@bunito/common';
import { ConfigService } from '../config-service';
import type { ConfigProvider } from '../types';
import { defineConfig } from './define-config';

function expectFactoryProvider<TConfig extends object>(
  config: ConfigProvider<TConfig>,
): Extract<ConfigProvider<TConfig>, { useFactory: unknown }> {
  expect(config).toEqual({
    token: expect.any(String),
    useFactory: expect.any(Function),
    scope: 'singleton',
    injects: [
      {
        useToken: ConfigService,
        defaultValue: {},
      },
    ],
  });

  if (!('useFactory' in config)) {
    throw new Error('Expected config factory provider');
  }

  return config;
}

describe('defineConfig', () => {
  it('rejects unnamed config definitions', () => {
    expect(() => defineConfig({} as never)).toThrow('Unnamed config');
  });

  it('creates a singleton async config provider from a named builder', async () => {
    const config = expectFactoryProvider(
      defineConfig(function Feature() {
        return { enabled: true };
      }),
    );

    expect(config.token).toBe('config(Feature)');
    expect(await config.useFactory(new ConfigService())).toEqual({
      enabled: true,
    });
  });

  it('passes the config context into the builder', async () => {
    const config = expectFactoryProvider(
      defineConfig(function Feature(context) {
        return {
          production: context.getFlag?.('isProd'),
        };
      }),
    );

    const result = await config.useFactory(
      new ConfigService(null, {
        NODE_ENV: 'production',
      }),
    );

    expect(result).toEqual({
      production: true,
    });
  });

  it('creates a value config provider when an explicit value is provided', () => {
    expect(
      defineConfig('Feature', {
        enabled: true,
      }),
    ).toEqual({
      token: 'config(Feature)',
      useValue: {
        enabled: true,
      },
    });
  });

  it('adds config context to config exceptions thrown by builders', async () => {
    const config = expectFactoryProvider(
      defineConfig(function Feature() {
        throw new InternalException('Invalid value');
      }),
    );

    let error: unknown;
    try {
      await config.useFactory(new ConfigService());
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(InternalException);
    expect((error as Error).message).toBe('config(Feature): Invalid value');
  });

  it('wraps non-config exceptions thrown by builders', async () => {
    const config = expectFactoryProvider(
      defineConfig(function Feature() {
        throw new Error('Boom');
      }),
    );

    let error: unknown;
    try {
      await config.useFactory(new ConfigService());
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(InternalException);
    expect((error as Error).message).toBe('config(Feature): Failed to build config');
    expect((error as Error).cause).toBeInstanceOf(Error);
  });
});
