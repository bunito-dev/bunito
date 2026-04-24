import { describe, expect, it } from 'bun:test';
import { ConfigModule, ConfigService, defineConfig } from './internals';

describe('config internals', () => {
  it('re-exports internal config building blocks', () => {
    expect(ConfigModule).toBeFunction();
    expect(ConfigService).toBeFunction();
    expect(defineConfig).toBeFunction();
  });
});
