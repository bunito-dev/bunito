import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { ServerConfig } from './server.config';
import { ServerService } from './server.service';

@Module({
  imports: [ConfigModule],
  uses: [ServerConfig, ServerService],
  exports: [ServerService],
})
export class ServerModule {}
