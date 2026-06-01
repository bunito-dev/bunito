import { describe, expect, it } from 'bun:test';
import { compilePattern } from './compile-pattern';

describe('compilePattern', () => {
  it('matches exact tokens and single-token wildcards', () => {
    const pattern = compilePattern('orders.*.created');

    expect(pattern.test('orders.eu.created')).toBeTrue();
    expect(pattern.test('orders.eu.high.created')).toBeFalse();
  });

  it('matches multi-token wildcards at the end of a pattern', () => {
    const pattern = compilePattern('orders.>');

    expect(pattern.test('orders.eu.created')).toBeTrue();
    expect(pattern.test('orders')).toBeFalse();
  });

  it('escapes regular expression tokens in literal pattern parts', () => {
    const pattern = compilePattern('orders.$created');

    expect(pattern.test('orders.$created')).toBeTrue();
    expect(pattern.test('orders.created')).toBeFalse();
  });

  it('rejects multi-token wildcards outside the last pattern token', () => {
    let error: unknown;
    try {
      compilePattern('orders.>.created');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'Wildcard can only be used as the last token in a pattern.',
    );
  });
});
