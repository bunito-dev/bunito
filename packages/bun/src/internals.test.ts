import { describe, expect, it } from 'bun:test';
import { BunSecretsExtension, BunSecretsModule, parseSecretKey } from './internals';

describe('bun internals', () => {
  it('re-exports bun secret building blocks', () => {
    expect(BunSecretsExtension).toBeFunction();
    expect(BunSecretsModule).toBeFunction();
    expect(parseSecretKey).toBeFunction();
  });
});
