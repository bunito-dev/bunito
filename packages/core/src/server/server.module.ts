import { ConfigModule } from '../config';
import { Module } from '../container';
import { ServerConfig } from './server.config';
import { ServerService } from './server.service';

@Module({
  imports: [ConfigModule],
  configs: [ServerConfig],
  providers: [ServerService],
})
export class ServerModule {}
