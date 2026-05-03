import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config/internals';
import { ServerConfig } from './server.config';

const originalEnv = { ...process.env };

afterEach(() => {
  restoreEnv('SERVER_PORT');
  restoreEnv('PORT');
  restoreEnv('SERVER_HOSTNAME');
  restoreEnv('HOSTNAME');
});

function restoreEnv(key: string): void {
  const value = originalEnv[key];

  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

describe('ServerConfig', () => {
  it('resolves server configuration from environment values and aliases', async () => {
    if (!('useFactory' in ServerConfig)) {
      throw new Error('Expected ServerConfig factory provider');
    }

    process.env.PORT = '3001';
    process.env.HOSTNAME = 'LOCALHOST';

    const config = await ServerConfig.useFactory(new ConfigService());

    expect(config).toEqual({
      port: 3001,
      hostname: 'localhost',
    });
  });

  it('prefers server-specific environment values and falls back to defaults', async () => {
    if (!('useFactory' in ServerConfig)) {
      throw new Error('Expected ServerConfig factory provider');
    }

    process.env.SERVER_PORT = '8080';
    process.env.PORT = '3001';
    process.env.SERVER_HOSTNAME = 'API.LOCAL';
    process.env.HOSTNAME = 'LOCALHOST';

    const explicit = await ServerConfig.useFactory(new ConfigService());

    delete process.env.SERVER_PORT;
    delete process.env.PORT;
    delete process.env.SERVER_HOSTNAME;
    delete process.env.HOSTNAME;

    const defaults = await ServerConfig.useFactory(new ConfigService());

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
