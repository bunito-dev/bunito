import { describe, expect, it } from 'bun:test';
import { getProviderMetadata } from '@bunito/container/internals';
import { ConfigReader } from './config-reader';

describe('ConfigReader', () => {
  it('registers config readers as indexed extensions', () => {
    @ConfigReader({ scope: 'singleton' })
    class ExampleReader implements ConfigReader {
      async getValue(key: string): Promise<unknown> {
        return key;
      }
    }

    expect(getProviderMetadata(ExampleReader)).toEqual({
      decorator: ConfigReader,
      options: {
        scope: 'singleton',
      },
    });
  });
});
