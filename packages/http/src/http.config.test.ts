import { describe, expect, it } from 'bun:test';
import { HttpConfig } from './http.config';

describe('HttpConfig', () => {
  it('resolves the default content type from env', async () => {
    expect(
      await HttpConfig.useFactory({
        getEnv: (() => 'text/plain') as never,
      } as never),
    ).toEqual({
      defaultContentType: 'text/plain',
    });
  });
});
