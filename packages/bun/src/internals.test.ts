import { describe, expect, it } from 'bun:test';
import { BunSecretsModule, parseSecretKey } from './internals';

describe('Bun internals', () => {
  it('re-exports Bun secret building blocks', () => {
    expect(BunSecretsModule).toBeFunction();
    expect(parseSecretKey).toBeFunction();
  });
});
