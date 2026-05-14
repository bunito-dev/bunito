import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { PrettyFormatterConfig } from './pretty-formatter-config';

describe('PrettyFormatterConfig', () => {
  it('resolves pretty logger configuration from environment', async () => {
    if (!('useFactory' in PrettyFormatterConfig)) {
      throw new Error('Expected PrettyFormatterConfig factory provider');
    }

    const config = await PrettyFormatterConfig.useFactory(
      new ConfigService(null, {
        DISABLE_LOG_COLORS: 'true',
        LOG_INSPECT_DEPTH: '3',
      }),
    );

    expect(config).toEqual({
      disableColor: true,
      inspectDepth: 3,
    });
  });

  it('falls back to defaults', async () => {
    if (!('useFactory' in PrettyFormatterConfig)) {
      throw new Error('Expected PrettyFormatterConfig factory provider');
    }

    const config = await PrettyFormatterConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      disableColor: false,
      inspectDepth: 10,
    });
  });
});
