import { describe, expect, it } from 'bun:test';
import { getModuleMetadata } from '@bunito/container/internals';
import { ServerConfig } from './server.config';
import { ServerModule } from './server.module';
import { ServerService } from './server.service';

describe('ServerModule', () => {
  it('registers and exports server providers', () => {
    expect(getModuleMetadata(ServerModule)).toEqual({
      configs: [ServerConfig],
      providers: [ServerService],
      exports: [ServerService],
    });
  });
});
