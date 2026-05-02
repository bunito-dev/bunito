import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config/internals';
import { PrettyConfig } from './pretty.config';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env.DISABLE_LOG_COLORS = originalEnv.DISABLE_LOG_COLORS;
  process.env.LOG_INSPECT_DEPTH = originalEnv.LOG_INSPECT_DEPTH;
});

describe('PrettyConfig', () => {
  it('resolves pretty logger configuration from environment', async () => {
    if (!('useFactory' in PrettyConfig)) {
      throw new Error('Expected PrettyConfig factory provider');
    }

    process.env.DISABLE_LOG_COLORS = 'true';
    process.env.LOG_INSPECT_DEPTH = '3';
    const config = await PrettyConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      disableColor: true,
      inspectDepth: 3,
    });
  });

  it('falls back to defaults', async () => {
    if (!('useFactory' in PrettyConfig)) {
      throw new Error('Expected PrettyConfig factory provider');
    }

    process.env.DISABLE_LOG_COLORS = undefined;
    process.env.LOG_INSPECT_DEPTH = undefined;
    const config = await PrettyConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      disableColor: false,
      inspectDepth: 10,
    });
  });
});
