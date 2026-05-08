import { describe, expect, it } from 'bun:test';
import type { Context } from '#context';
import { Command } from './command';

class TestCommand extends Command<{ value: string }> {
  async run(): Promise<void> {}

  get state(): { value: string; context: Context } {
    return {
      value: this.options.value,
      context: this.context,
    };
  }
}

describe('Command', () => {
  it('stores command options and context for subclasses', () => {
    const context = {} as Context;
    const command = new TestCommand({ value: 'demo' }, context);

    expect(command.state).toEqual({
      value: 'demo',
      context,
    });
  });
});
