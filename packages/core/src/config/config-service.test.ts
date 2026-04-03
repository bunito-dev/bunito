import { afterEach, describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../container/constants';
import { ConfigService } from './config-service';

const originalCi = process.env.CI;
const originalTestValue = process.env.TEST_CONFIG_VALUE;

afterEach(() => {
  if (originalCi === undefined) {
    delete process.env.CI;
  } else {
    process.env.CI = originalCi;
  }

  if (originalTestValue === undefined) {
    delete process.env.TEST_CONFIG_VALUE;
  } else {
    process.env.TEST_CONFIG_VALUE = originalTestValue;
  }
});

describe('ConfigService', () => {
  it('should be registered as a provider', () => {
    expect(
      getDecoratorMetadata<Record<string, never>>(
        ConfigService,
        DECORATOR_METADATA_KEYS.provider,
      ),
    ).toEqual({});
  });

  it('should bind public methods in the constructor', () => {
    process.env.CI = 'true';
    process.env.TEST_CONFIG_VALUE = '42';

    const service = new ConfigService();
    const { whenCI, getEnv } = service;

    expect(whenCI('ci', 'non-ci')).toBe('ci');
    expect(getEnv('TEST_CONFIG_VALUE', Number)).toBe(42);
  });

  it('should return CI-specific values only when CI=true', () => {
    const service = new ConfigService();

    process.env.CI = 'true';
    expect(service.whenCI('ci', 'non-ci')).toBe('ci');

    process.env.CI = 'false';
    expect(service.whenCI('ci', 'non-ci')).toBe('non-ci');

    delete process.env.CI;
    expect(service.whenCI('ci', 'non-ci')).toBe('non-ci');
  });

  it('should return parsed env values when a parser is provided', () => {
    process.env.TEST_CONFIG_VALUE = '123';

    const service = new ConfigService();

    expect(service.getEnv('TEST_CONFIG_VALUE', Number)).toBe(123);
    expect(service.getEnv('TEST_CONFIG_VALUE', (value) => value.toUpperCase())).toBe(
      '123',
    );
  });

  it('should return undefined when the env value is missing', () => {
    delete process.env.TEST_CONFIG_VALUE;

    const service = new ConfigService();

    expect(service.getEnv('TEST_CONFIG_VALUE', Number)).toBeUndefined();
  });

  it('should return the raw env value when no parser is provided', () => {
    process.env.TEST_CONFIG_VALUE = 'raw-value';

    const service = new ConfigService();

    expect(service.getEnv('TEST_CONFIG_VALUE')).toBe('raw-value');
  });
});
