import { describe, expect, it } from 'bun:test';
import { ConfigService } from '../config-service';
import { registerConfig } from './register-config';

describe('registerConfig', () => {
  it('should create a module-scoped factory provider for the named config', () => {
    const factory = () => ({ port: 3000 });

    const result = registerConfig('app', factory);

    expect(typeof result.token).toBe('symbol');
    expect(String(result.token)).toBe('Symbol(config(app))');
    expect(result.useFactory).toBe(factory);
    expect(result.scope).toBe('module');
    expect(result.injects).toEqual([ConfigService]);
  });
});
