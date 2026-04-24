import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { BunSecretsExtension } from './bun-secrets.extension';
import { BunSecretsModule } from './bun-secrets.module';

describe('BunSecretsModule', () => {
  it('registers and exports BunSecretsExtension', () => {
    expect(getDecoratorMetadata(BunSecretsModule, 'module')).toEqual({
      extensions: [BunSecretsExtension],
      exports: [BunSecretsExtension],
    });
  });
});
