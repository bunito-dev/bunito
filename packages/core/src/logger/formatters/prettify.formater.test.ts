import { describe, expect, it } from 'bun:test';
import { prettifyFormatter } from './prettify.formater';

type FakeStdout = {
  output: string;
  write: (chunk: string) => boolean;
};

function createStdout(): FakeStdout {
  return {
    output: '',
    write(chunk: string) {
      this.output += chunk;
      return true;
    },
  };
}

describe('prettifyFormatter', () => {
  it('should render string messages with context and data items', () => {
    const stdout = createStdout();

    prettifyFormatter(stdout as unknown as NodeJS.WriteStream, 'App', 'info', 'hello', [
      { foo: 'bar' },
    ]);

    expect(stdout.output).toContain('INFO');
    expect(stdout.output).toContain('[App]');
    expect(stdout.output).toContain('hello');
    expect(stdout.output).toContain("{ foo: 'bar' }");
  });

  it('should render errors with their message and inspection output', () => {
    const stdout = createStdout();
    const error = new Error('boom');

    prettifyFormatter(
      stdout as unknown as NodeJS.WriteStream,
      undefined,
      'error',
      error,
      [],
    );

    expect(stdout.output).toContain('ERROR');
    expect(stdout.output).toContain('boom');
    expect(stdout.output).toContain('Error: boom');
  });

  it('should treat non-string messages as data', () => {
    const stdout = createStdout();

    prettifyFormatter(
      stdout as unknown as NodeJS.WriteStream,
      undefined,
      'debug',
      { foo: 'bar' },
      [],
    );

    expect(stdout.output).toContain('DEBUG');
    expect(stdout.output).toContain("{ foo: 'bar' }");
  });
});
