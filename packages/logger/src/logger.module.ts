import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { JSONExtension, PrettyConfig, PrettyExtension } from './extensions';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  configs: [LoggerConfig, PrettyConfig],
  providers: [Logger, LoggerService],
  extensions: [PrettyExtension, JSONExtension],
  exports: [Logger],
})
export class LoggerModule {}
