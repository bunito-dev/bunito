import { Module } from '@bunito/container';
import { ConfigService } from './config.service';

@Module({
  uses: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
