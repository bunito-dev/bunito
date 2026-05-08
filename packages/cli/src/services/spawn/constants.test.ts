import { describe, expect, it } from 'bun:test';
import { PROCESS_COLORS } from './constants';

describe('spawn constants', () => {
  it('exports process prefix colors', () => {
    expect(PROCESS_COLORS).toContain('cyan');
    expect(PROCESS_COLORS).toContain('blueBright');
  });
});
