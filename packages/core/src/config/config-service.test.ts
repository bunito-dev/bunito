import { afterEach, describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata } from '../container';
import { CONTAINER_METADATA_KEYS } from '../container';
import { ConfigService } from './config-service';

const ENV_KEYS = [
  'CI',
  'TEST_CONFIG_VALUE',
  'ALT_TEST_CONFIG_VALUE',
  'TEST_BOOLEAN',
  'TEST_DECIMAL',
  'TEST_INTEGER',
  'TEST_PORT',
  'TEST_FORMAT',
] as const;

const originalEnv = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = originalEnv.get(key);

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe('ConfigService', () => {
  it('should be registered as a singleton provider', () => {
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        ConfigService,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
    });
  });

  it('should bind getEnv and getEnvAs in the constructor', () => {
    process.env.TEST_CONFIG_VALUE = '42';
    process.env.TEST_BOOLEAN = 'yes';

    const service = new ConfigService();
    const { getEnv, getEnvAs } = service;

    expect(getEnv('TEST_CONFIG_VALUE', Number)).toBe(42);
    expect(getEnvAs('TEST_BOOLEAN', 'boolean')).toBeTrue();
  });

  it('should expose the CI flag captured during construction', () => {
    process.env.CI = 'true';
    const ciService = new ConfigService();

    process.env.CI = 'false';
    const nonCiService = new ConfigService();

    expect(ciService.isCI).toBeTrue();
    expect(nonCiService.isCI).toBeFalse();
  });

  it('should parse env values with function parsers and parser objects', () => {
    process.env.TEST_CONFIG_VALUE = '123';

    const service = new ConfigService();

    expect(service.getEnv('TEST_CONFIG_VALUE', Number)).toBe(123);
    expect(
      service.getEnv('TEST_CONFIG_VALUE', {
        safeParse(value: unknown) {
          const text = String(value);

          return {
            success: text === '123',
            data: text.toUpperCase(),
          };
        },
      }),
    ).toBe('123');
    expect(
      service.getEnv('TEST_CONFIG_VALUE', {
        safeParse() {
          return {
            success: false as const,
            error: 'invalid',
          };
        },
      }),
    ).toBeUndefined();
  });

  it('should resolve the first non-empty value from env key arrays', () => {
    process.env.ALT_TEST_CONFIG_VALUE = 'fallback';

    const service = new ConfigService();

    expect(service.getEnv(['TEST_CONFIG_VALUE', 'ALT_TEST_CONFIG_VALUE'])).toBe(
      'fallback',
    );
  });

  it('should parse boolean env values and reject unsupported ones', () => {
    const service = new ConfigService();

    process.env.TEST_BOOLEAN = 'on';
    expect(service.getEnvAs('TEST_BOOLEAN', 'boolean')).toBeTrue();

    process.env.TEST_BOOLEAN = 'off';
    expect(service.getEnvAs('TEST_BOOLEAN', 'boolean')).toBeFalse();

    process.env.TEST_BOOLEAN = 'maybe';
    expect(service.getEnvAs('TEST_BOOLEAN', 'boolean')).toBeUndefined();
  });

  it('should parse decimal, integer and port values with bounds', () => {
    const service = new ConfigService();

    process.env.TEST_DECIMAL = '10_000.5';
    process.env.TEST_INTEGER = '42';
    process.env.TEST_PORT = '8080';

    expect(service.getEnvAs('TEST_DECIMAL', 'toDecimal', [1000, 20000])).toBe(10000.5);
    expect(service.getEnvAs('TEST_INTEGER', 'toInteger', [1, 100])).toBe(42);
    expect(service.getEnvAs('TEST_PORT', 'port')).toBe(8080);

    process.env.TEST_INTEGER = '200';
    process.env.TEST_PORT = '70000';

    expect(service.getEnvAs('TEST_INTEGER', 'toInteger', [1, 100])).toBeUndefined();
    expect(service.getEnvAs('TEST_PORT', 'port')).toBeUndefined();
  });

  it('should parse string formats and honor allow-lists', () => {
    process.env.TEST_FORMAT = ' Debug ';

    const service = new ConfigService();

    expect(service.getEnvAs('TEST_FORMAT', 'string')).toBe('Debug');
    expect(service.getEnvAs('TEST_FORMAT', 'toUpperCase', ['DEBUG'])).toBe('DEBUG');
    expect(service.getEnvAs('TEST_FORMAT', 'toLowerCase', ['debug'])).toBe('debug');
    expect(service.getEnvAs('TEST_FORMAT', 'toUpperCase', ['INFO'])).toBeUndefined();
  });

  it('should return undefined when the env value is missing or blank', () => {
    process.env.TEST_CONFIG_VALUE = '   ';
    delete process.env.ALT_TEST_CONFIG_VALUE;

    const service = new ConfigService();

    expect(service.getEnv('ALT_TEST_CONFIG_VALUE')).toBeUndefined();
    expect(service.getEnv('TEST_CONFIG_VALUE')).toBeUndefined();
    expect(service.getEnvAs('ALT_TEST_CONFIG_VALUE', 'boolean')).toBeUndefined();
  });
});
