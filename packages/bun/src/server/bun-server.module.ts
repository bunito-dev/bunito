import { Module } from '@bunito/container';
import { BunServerConfig } from './bun-server.config';
import { BunServerService } from './bun-server.service';

@Module({
  configs: [BunServerConfig],
  providers: [BunServerService],
  exports: [BunServerService],
})
export class BunServerModule {}
