import { describe, expect, it } from 'bun:test';
import { jsonFormatter } from './json.formater';

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

describe('jsonFormatter', () => {
  it('should serialize string messages with context and inspected args', () => {
    const stdout = createStdout();

    jsonFormatter(stdout as unknown as NodeJS.WriteStream, 'App', 'info', 'hello', [
      { foo: 'bar' },
    ]);

    const record = JSON.parse(stdout.output);

    expect(record.type).toBe('info');
    expect(record.level).toBe(30);
    expect(record.context).toBe('App');
    expect(record.message).toBe('hello');
    expect(record.data).toEqual(["{ foo: 'bar' }"]);
    expect(record.timestamp).toBeDefined();
  });

  it('should serialize errors under the error field', () => {
    const stdout = createStdout();
    const error = new Error('boom');

    jsonFormatter(stdout as unknown as NodeJS.WriteStream, undefined, 'error', error, []);

    const record = JSON.parse(stdout.output);

    expect(record.type).toBe('error');
    expect(record.error).toBeDefined();
    expect(record.error.name).toBe('Error');
    expect(record.error.message).toBe('boom');
    expect(record.error.stack).toContain('Error: boom');
    expect(record.message).toBeUndefined();
  });

  it('should treat non-string, non-error messages as data', () => {
    const stdout = createStdout();

    jsonFormatter(
      stdout as unknown as NodeJS.WriteStream,
      undefined,
      'debug',
      { foo: 'bar' },
      [123],
    );

    const record = JSON.parse(stdout.output);

    expect(record.data).toEqual(["{ foo: 'bar' }", '123']);
  });
});
