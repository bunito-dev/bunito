import { describe, expect, it } from 'bun:test';
import { PrettyConfig } from './pretty.config';

describe('PrettyConfig', () => {
  it('resolves pretty logger configuration from environment', async () => {
    expect('useFactory' in PrettyConfig).toBeTrue();
    if (!('useFactory' in PrettyConfig)) {
      throw new Error('Expected pretty config factory');
    }

    const result = await PrettyConfig.useFactory({
      getEnv: (_key: string, format?: string) => {
        if (format === 'boolean') {
          return true;
        }

        return 3;
      },
    } as never);

    expect(result).toEqual({
      disableColor: true,
      inspectDepth: 3,
    });
  });

  it('falls back to defaults', async () => {
    expect('useFactory' in PrettyConfig).toBeTrue();
    if (!('useFactory' in PrettyConfig)) {
      throw new Error('Expected pretty config factory');
    }

    const result = await PrettyConfig.useFactory({
      getEnv: () => undefined,
    } as never);

    expect(result).toEqual({
      disableColor: false,
      inspectDepth: 10,
    });
  });
});
