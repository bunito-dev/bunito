import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { JSONExtension } from './json';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';
import { PrettyConfig, PrettyExtension } from './pretty';

@Module({
  imports: [ConfigModule],
  configs: [LoggerConfig, PrettyConfig],
  providers: [Logger, LoggerService],
  extensions: [PrettyExtension, JSONExtension],
  exports: [Logger],
})
export class LoggerModule {}
