import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const env: Record<string, string | undefined> = {};
const writes: string[] = [];

mock.module('node:process', () => ({
  env,
}));

mock.module('node:util', () => ({
  styleText: (_style: string | string[], text: string) => text,
}));

const consoleWithWrite = console as typeof console & {
  write: (message: string) => void;
};
const originalWrite = consoleWithWrite.write;
const { warn } = await import('./warn');

describe('warn', () => {
  afterAll(() => {
    consoleWithWrite.write = originalWrite;
  });

  beforeEach(() => {
    for (const key of Object.keys(env)) {
      delete env[key];
    }

    writes.length = 0;
    consoleWithWrite.write = mock((message: string) => {
      writes.push(message);

      return message.length;
    }) as typeof consoleWithWrite.write;
  });

  it('hides warnings by default in test environments', () => {
    env.NODE_ENV = 'test';

    warn('Hidden warning');

    expect(writes).toEqual([]);
  });

  it('prints warnings in test environments when hiding is explicitly disabled', () => {
    env.NODE_ENV = 'test';
    env.HIDE_WARNINGS = 'false';

    warn('Visible warning', 'first detail', 'second detail');

    expect(writes).toEqual([
      'WARNING Visible warning\n» first detail\n» second detail\n',
    ]);
  });

  it('hides warnings outside test environments when requested', () => {
    env.NODE_ENV = 'production';
    env.HIDE_WARNINGS = 'true';

    warn('Hidden warning');

    expect(writes).toEqual([]);
  });

  it('prints warnings outside test environments by default', () => {
    env.NODE_ENV = 'development';

    warn('Visible warning');

    expect(writes).toEqual(['WARNING Visible warning\n']);
  });
});
