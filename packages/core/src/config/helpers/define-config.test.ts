import { describe, expect, it } from 'bun:test';
import { ConfigService } from '../config-service';
import { defineConfig } from './define-config';

describe('defineConfig', () => {
  it('should create a module-scoped factory provider for the named config', () => {
    const factory = () => ({ port: 3000 });

    const result = defineConfig('appConfig', factory);

    expect(typeof result.token).toBe('symbol');
    expect(String(result.token)).toBe('Symbol(appConfig)');
    expect(result.useFactory).toBe(factory);
    expect(result.scope).toBe('singleton');
    expect(result.injects).toEqual([ConfigService]);
  });
});
