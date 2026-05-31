import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { BunServerConfig } from './bun-server.config';
import { BunServerModule } from './bun-server.module';
import { BunServerService } from './bun-server.service';
import { BUN_SERVER_FACTORY_ID } from './constants';

describe('BunServerModule', () => {
  it('registers and exports server providers', () => {
    expect(getClassMetadata(BunServerModule, 'module')).toEqual({
      configs: [BunServerConfig],
      providers: [
        BunServerService,
        {
          token: BUN_SERVER_FACTORY_ID,
          useValue: Bun.serve,
        },
      ],
      exports: [BunServerService],
    });
  });
});
