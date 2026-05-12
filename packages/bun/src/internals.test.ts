import { describe, expect, it } from 'bun:test';
import { parseSecretKey, SecretsModule } from './internals';

describe('Bun internals', () => {
  it('re-exports Bun secret building blocks', () => {
    expect(SecretsModule).toBeFunction();
    expect(parseSecretKey).toBeFunction();
  });
});
