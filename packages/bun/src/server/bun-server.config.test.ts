import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { BunServerConfig } from './bun-server.config';

describe('BunServerConfig', () => {
  it('resolves server configuration from environment values and aliases', async () => {
    if (!('useFactory' in BunServerConfig)) {
      throw new Error('Expected BunServerConfig factory provider');
    }

    const config = await BunServerConfig.useFactory(
      new ConfigService(null, {
        PORT: '3001',
        HOSTNAME: 'LOCALHOST',
      }),
    );

    expect(config).toEqual({
      port: 3001,
      hostname: 'localhost',
    });
  });

  it('prefers server-specific environment values and falls back to defaults', async () => {
    if (!('useFactory' in BunServerConfig)) {
      throw new Error('Expected BunServerConfig factory provider');
    }

    const explicit = await BunServerConfig.useFactory(
      new ConfigService(null, {
        SERVER_PORT: '8080',
        PORT: '3001',
        SERVER_HOSTNAME: 'API.LOCAL',
        HOSTNAME: 'LOCALHOST',
      }),
    );

    const defaults = await BunServerConfig.useFactory(new ConfigService());

    expect(explicit).toEqual({
      port: 8080,
      hostname: 'api.local',
    });
    expect(defaults).toEqual({
      port: 3000,
      hostname: '0.0.0.0',
    });
  });
});
