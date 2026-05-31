import { describe, expect, it } from 'bun:test';
import { CLIException } from './cli.exception';

describe('CLIException', () => {
  it('stores the exception name and optional instructions', () => {
    const error = new CLIException('Failed', 'Check config', 'Retry');

    expect(error.name).toBe('CLIException');
    expect(error.message).toBe('Failed');
    expect(error.instructions).toEqual(['Check config', 'Retry']);
    expect(new CLIException('Plain').instructions).toBeUndefined();
  });
});
