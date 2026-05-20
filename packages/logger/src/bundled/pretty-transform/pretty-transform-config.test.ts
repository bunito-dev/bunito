import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { PrettyTransformConfig } from './pretty-transform-config';

describe('PrettyTransformConfig', () => {
  it('reads pretty transform settings from the environment', async () => {
    if (!('useFactory' in PrettyTransformConfig)) {
      throw new Error('Expected PrettyTransformConfig factory provider');
    }

    expect(await PrettyTransformConfig.useFactory(new ConfigService())).toEqual({
      disableColor: false,
      inspectDepth: 10,
    });
    expect(
      await PrettyTransformConfig.useFactory(
        new ConfigService(null, {
          DISABLE_LOG_COLORS: 'true',
          LOG_INSPECT_DEPTH: '3',
        }),
      ),
    ).toEqual({
      disableColor: true,
      inspectDepth: 3,
    });
  });
});
