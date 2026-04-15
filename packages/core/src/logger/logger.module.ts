import { ConfigModule } from '../config';
import { Module } from '../container';
import { JSONFormatter, PrettyConfig, PrettyFormatter } from './formatters';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  configs: [LoggerConfig, PrettyConfig],
  providers: [Logger, LoggerService],
  formatters: [JSONFormatter, PrettyFormatter],
  exports: [Logger],
})
export class LoggerModule {}
