import { describe, expect, it } from 'bun:test';
import { Controller, HttpModule, JSONMiddleware, Middleware } from './internals';

describe('http internals', () => {
  it('re-exports internal HTTP building blocks', () => {
    expect(Controller).toBeFunction();
    expect(HttpModule).toBeFunction();
    expect(JSONMiddleware).toBeFunction();
    expect(Middleware).toBeFunction();
  });
});
