import { describe, expect, it } from 'bun:test';
import { PrettifyFormater } from './prettify.formater';

describe('PrettifyFormater', () => {
  it('should configure formatter options from config service', () => {
    const formatter = new PrettifyFormater();

    formatter.configure({
      getEnvAs(key: string, format: string) {
        if (key === 'USE_LOG_COLORS' && format === 'boolean') {
          return false;
        }

        if (key === 'LOG_INSPECT_DEPTH' && format === 'toInteger') {
          return 4;
        }

        return undefined;
      },
    } as never);

    expect(formatter).toMatchObject({
      options: {
        useColors: false,
        inspectDepth: 4,
      },
    });
  });

  it('should render messages, durations, errors and data without colors', () => {
    const formatter = new PrettifyFormater({
      useColors: false,
      inspectDepth: 2,
    });
    const output = formatter.formatLog({
      timestamp: '2026-01-01T00:00:00.000Z',
      context: 'App',
      traceId: 7,
      level: {
        kind: 'ERROR',
        value: 50,
      },
      message: 'boom',
      error: new Error('boom'),
      data: ['first line', { foo: 'bar' }],
      duration: 1500,
    });

    expect(output).toContain('✘');
    expect(output).toContain('2026-01-01T00:00:00.000Z');
    expect(output).toContain('[App#7]');
    expect(output).toContain('boom');
    expect(output).toContain('+1.500s');
    expect(output).toContain('first line');
    expect(output).toContain("foo: 'bar'");
  });

  it('should support zero and sub-second durations', () => {
    const formatter = new PrettifyFormater({
      useColors: false,
    });
    const zero = formatter.formatLog({
      timestamp: '2026-01-01T00:00:00.000Z',
      level: {
        kind: 'OK',
        value: 30,
      },
      duration: 0,
    });
    const subSecond = formatter.formatLog({
      timestamp: '2026-01-01T00:00:00.000Z',
      level: {
        kind: 'INFO',
        value: 30,
      },
      duration: 25,
    });

    expect(zero).toContain('~1ms');
    expect(subSecond).toContain('+25ms');
  });
});
