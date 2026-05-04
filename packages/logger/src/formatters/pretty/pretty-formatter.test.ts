import { describe, expect, it } from 'bun:test';
import { PrettyFormatter } from './pretty-formatter';

describe('PrettyFormatter', () => {
  it('formats readable log output without colors', () => {
    const formatter = new PrettyFormatter({
      disableColor: true,
      inspectDepth: 3,
    });
    const output = formatter.formatLog({
      level: {
        name: 'INFO',
        value: 30,
      },
      context: 'Context',
      traceId: 3,
      message: 'Hello',
      data: ['details', [{ nested: true }], { object: true }],
      timestamp: new Date('2026-05-02T10:20:30.123Z'),
      duration: 1530,
    });

    expect(output).toContain('INFO');
    expect(output).toContain('[Context]');
    expect(output).toContain('#3');
    expect(output).toContain('Hello');
    expect(output).toContain('+1.530s');
    expect(output).toContain('details');
    expect(output).toContain('[0]');
    expect(output).toContain('object');
  });

  it('includes inspected errors and supports colored output path', () => {
    const formatter = new PrettyFormatter({
      disableColor: false,
      inspectDepth: 1,
    });
    const output = formatter.formatLog({
      level: {
        name: 'ERROR',
        value: 50,
      },
      error: new Error('Boom'),
      timestamp: new Date('2026-05-02T10:20:30.123Z'),
    });

    expect(output).toContain('ERROR');
    expect(output).toContain('Boom');
  });
});
