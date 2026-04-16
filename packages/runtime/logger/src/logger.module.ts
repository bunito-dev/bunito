import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { JSONFormatter, PrettyConfig, PrettyFormatter } from './formatters';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  uses: [
    LoggerConfig,
    PrettyConfig,
    JSONFormatter,
    PrettyFormatter,
    Logger,
    LoggerService,
  ],
  exports: [Logger],
})
export class LoggerModule {}
