import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { ConfigExtension } from './config.extension';
import { CONFIG_EXTENSION } from './constants';

describe('ConfigExtension', () => {
  it('registers a singleton config extension', () => {
    @ConfigExtension({
      injects: ['dependency'],
    })
    class TestExtension implements ConfigExtension {
      async getSecret(): Promise<unknown> {
        return 'secret';
      }
    }

    expect(getDecoratorMetadata(TestExtension, 'extension')).toEqual({
      key: CONFIG_EXTENSION,
      options: undefined,
    });
    expect(getDecoratorMetadata(TestExtension, 'provider')).toEqual({
      options: {
        scope: 'singleton',
        injects: ['dependency'],
      },
    });
  });
});
