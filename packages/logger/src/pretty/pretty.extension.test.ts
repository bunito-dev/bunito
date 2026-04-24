import { describe, expect, it } from 'bun:test';
import { PrettyExtension } from './pretty.extension';

describe('PrettyExtension', () => {
  it('formats readable log output without colors', () => {
    const extension = new PrettyExtension({
      disableColor: true,
      inspectDepth: 2,
    });

    const output = extension.formatLog({
      timestamp: new Date(2026, 3, 23, 10, 20, 30, 456),
      context: 'Test',
      traceId: 1,
      level: {
        name: 'INFO',
        value: 30,
      },
      message: 'hello',
      data: ['line', [{ nested: true }], { object: true }],
      duration: 0,
    });

    expect(output).toContain('[10:20:30.456] ➥ INFO [Test] #1 hello ~1ms');
    expect(output).toContain('∙ line');
    expect(output).toContain('[0]');
    expect(output).toContain('object');
  });

  it('includes inspected errors', () => {
    const extension = new PrettyExtension({
      disableColor: true,
      inspectDepth: 1,
    });

    const output = extension.formatLog({
      timestamp: new Date(2026, 3, 23, 10, 20, 30, 456),
      level: {
        name: 'ERROR',
        value: 50,
      },
      error: new Error('boom'),
    });

    expect(output).toContain('✘ ERROR');
    expect(output).toContain('error: boom');
  });
});
