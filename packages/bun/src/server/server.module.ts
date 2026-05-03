import { Module } from '@bunito/container';
import { ServerConfig } from './server.config';
import { ServerService } from './server.service';

@Module({
  configs: [ServerConfig],
  providers: [ServerService],
  exports: [ServerService],
})
export class ServerModule {}
