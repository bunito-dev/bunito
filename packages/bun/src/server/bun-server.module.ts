import { Module } from '@bunito/container';
import { BunServerConfig } from './bun-server.config';
import { BunServerService } from './bun-server.service';
import { BUN_SERVER_FACTORY_ID } from './constants';

@Module({
  configs: [BunServerConfig],
  providers: [
    BunServerService,
    {
      token: BUN_SERVER_FACTORY_ID,
      useValue: Bun.serve,
    },
  ],
  exports: [BunServerService],
})
export class BunServerModule {}
