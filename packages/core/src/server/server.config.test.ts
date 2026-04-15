import { describe, expect, it } from 'bun:test';
import { ServerConfig } from './server.config';

describe('ServerConfig', () => {
  it('resolves explicit and fallback server settings', async () => {
    expect(
      await ServerConfig.useFactory({
        getEnv: ((keyLike: string | string[], format?: string) => {
          const key = Array.isArray(keyLike) ? keyLike[0] : keyLike;

          switch (`${key}:${format ?? ''}`) {
            case 'SERVER_PORT:port':
              return 4100;
            case 'SERVER_HOSTNAME:string':
              return '127.0.0.2';
            default:
              return undefined;
          }
        }) as never,
      } as never),
    ).toEqual({
      port: 4100,
      hostname: '127.0.0.2',
    });
  });
});
