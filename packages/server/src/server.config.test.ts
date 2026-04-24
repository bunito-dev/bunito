import { describe, expect, it } from 'bun:test';
import { ServerConfig } from './server.config';

describe('ServerConfig', () => {
  it('resolves server configuration from environment with aliases', async () => {
    expect('useFactory' in ServerConfig).toBeTrue();
    if (!('useFactory' in ServerConfig)) {
      throw new Error('Expected server config factory');
    }

    const result = await ServerConfig.useFactory({
      getEnv: (keys: string | string[], format?: string) => {
        expect(keys).toBeArray();

        if (format === 'port') {
          return 8080;
        }

        return '127.0.0.1';
      },
    } as never);

    expect(result).toEqual({
      port: 8080,
      hostname: '127.0.0.1',
    });
  });

  it('falls back to defaults', async () => {
    expect('useFactory' in ServerConfig).toBeTrue();
    if (!('useFactory' in ServerConfig)) {
      throw new Error('Expected server config factory');
    }

    const result = await ServerConfig.useFactory({
      getEnv: () => undefined,
    } as never);

    expect(result).toEqual({
      port: 4000,
      hostname: '0.0.0.0',
    });
  });
});
