import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { BunSecretsConfigReader } from './bun-secrets.config-reader';
import { BunSecretsModule } from './bun-secrets.module';
import { BunSecretsService } from './bun-secrets.service';

describe('SecretsModule', () => {
  it('registers secrets service and config reader extension', () => {
    expect(getClassMetadata(BunSecretsModule, 'module')).toEqual({
      providers: [BunSecretsService],
      extensions: [BunSecretsConfigReader],
      exports: [BunSecretsService],
    });
  });
});
