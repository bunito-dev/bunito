import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { Command } from './command';

describe('Command', () => {
  it('stores command providers as command extensions', () => {
    @Command({ scope: 'singleton' })
    class ExampleCommand {
      async run(): Promise<void> {}

      build() {
        return {
          command: 'example',
        };
      }
    }

    expect(getClassMetadata(ExampleCommand, 'provider')).toEqual({
      decorator: Command,
      options: {
        scope: 'singleton',
      },
    });
  });
});
