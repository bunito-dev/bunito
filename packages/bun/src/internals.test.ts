import { describe, expect, it } from 'bun:test';
import { parseSecretKey, SecretsConfigReader, SecretsModule } from './internals';

describe('Bun internals', () => {
  it('re-exports Bun secret building blocks', () => {
    expect(SecretsConfigReader).toBeFunction();
    expect(SecretsModule).toBeFunction();
    expect(parseSecretKey).toBeFunction();
  });
});
