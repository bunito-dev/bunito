import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { ServerConfig } from './server-config';
import { ServerModule } from './server-module';
import { ServerService } from './server-service';

describe('ServerModule', () => {
  it('registers and exports server providers', () => {
    expect(getClassMetadata(ServerModule, 'module')).toEqual({
      configs: [ServerConfig],
      providers: [ServerService],
      exports: [ServerService],
    });
  });
});
