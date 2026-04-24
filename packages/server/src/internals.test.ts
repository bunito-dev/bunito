import { describe, expect, it } from 'bun:test';
import { HttpException, ServerConfig, ServerExtension, ServerModule } from './internals';

describe('server internals', () => {
  it('re-exports internal server building blocks', () => {
    expect(HttpException).toBeFunction();
    expect(ServerConfig).toBeObject();
    expect(ServerExtension).toBeFunction();
    expect(ServerModule).toBeFunction();
  });
});
