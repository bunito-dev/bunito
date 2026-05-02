import { describe, expect, it } from 'bun:test';
import { getModuleMetadata } from '@bunito/container/internals';
import { SecretsConfigReader } from './secrets.config-reader';
import { SecretsModule } from './secrets.module';
import { SecretsService } from './secrets.service';

describe('SecretsModule', () => {
  it('registers secrets service and config reader extension', () => {
    expect(getModuleMetadata(SecretsModule)).toEqual({
      providers: [SecretsService],
      extensions: [SecretsConfigReader],
      exports: [SecretsService, SecretsConfigReader],
    });
  });
});
