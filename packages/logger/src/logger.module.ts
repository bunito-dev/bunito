import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { JSONLogFormatter, PrettyConfig, PrettyLogFormatter } from './formatters';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  configs: [LoggerConfig, PrettyConfig],
  providers: [Logger, LoggerService],
  extensions: [PrettyLogFormatter, JSONLogFormatter],
  exports: [Logger],
})
export class LoggerModule {}
