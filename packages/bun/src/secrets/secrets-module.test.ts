import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { SecretsConfigReader } from './secrets-config-reader';
import { SecretsModule } from './secrets-module';
import { SecretsService } from './secrets-service';

describe('SecretsModule', () => {
  it('registers secrets service and config reader extension', () => {
    expect(getClassMetadata(SecretsModule, 'module')).toEqual({
      providers: [SecretsService],
      extensions: [SecretsConfigReader],
      exports: [SecretsService],
    });
  });
});
