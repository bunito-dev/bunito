import { describe, expect, it } from 'bun:test';
import { HttpConfig } from './http.config';

describe('httpConfig', () => {
  it('should create a module-scoped config provider', async () => {
    const service = {
      getEnv: () => undefined,
    };

    expect(typeof HttpConfig.token).toBe('symbol');
    expect(String(HttpConfig.token)).toBe('Symbol(config(http))');
    expect(HttpConfig.scope).toBe('module');
    expect(await HttpConfig.useFactory(service)).toEqual({
      port: 3000,
    });
  });

  it('should prefer HTTP_PORT over PORT', async () => {
    const service = {
      getEnv: (key: string) => {
        if (key === 'HTTP_PORT') {
          return '4000';
        }

        if (key === 'PORT') {
          return '3001';
        }
      },
    };

    expect(await HttpConfig.useFactory(service)).toEqual({
      port: '4000',
    });
  });
});
