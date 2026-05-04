import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { JSONFormatter, PrettyFormatter, PrettyFormatterConfig } from './formatters';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  configs: [LoggerConfig, PrettyFormatterConfig],
  providers: [Logger, LoggerService],
  extensions: [PrettyFormatter, JSONFormatter],
  exports: [Logger],
})
export class LoggerModule {}
