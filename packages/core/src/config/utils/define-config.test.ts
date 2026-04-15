import { describe, expect, it } from 'bun:test';
import { ConfigService } from '../config.service';
import { defineConfig } from './define-config';

describe('defineConfig', () => {
  it('creates a singleton config provider definition', () => {
    const config = defineConfig('Feature', () => ({ enabled: true }));

    expect(config).toEqual({
      token: expect.any(Symbol),
      useFactory: expect.any(Function),
      scope: 'singleton',
      injects: [ConfigService],
    });
  });
});
