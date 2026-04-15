import { describe, expect, it } from 'bun:test';
import { PrettyConfig } from './pretty.config';

describe('PrettyConfig', () => {
  it('resolves pretty formatter config from env', async () => {
    const getEnv = ((key: string, format?: string) => {
      switch (`${key}:${format ?? ''}`) {
        case 'LOG_COLORS:boolean':
          return false;
        case 'LOG_INSPECT_DEPTH:toInteger':
          return 5;
        default:
          return undefined;
      }
    }) as never;

    expect(
      await PrettyConfig.useFactory({
        getEnv,
      } as never),
    ).toEqual({
      colors: false,
      inspectDepth: 5,
    });
  });
});
