import { describe, expect, it } from 'bun:test';
import { PKG_INFO_FILE, PKG_INFO_SCHEMA } from './constants';

describe('fs constants', () => {
  it('exports package metadata defaults', () => {
    const parsed = PKG_INFO_SCHEMA.parse({
      name: 'demo',
      dependencies: {},
    });

    expect(PKG_INFO_FILE).toBe('package.json');
    expect(parsed).toEqual({
      name: 'demo',
      type: 'module',
      scripts: {},
      dependencies: {},
      devDependencies: {},
      engines: {},
    });
  });
});
