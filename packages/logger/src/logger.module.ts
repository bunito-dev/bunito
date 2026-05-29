import { Module } from '@bunito/container';
import { JSONLoggerModule, PrettyLoggerModule } from './bundled';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [JSONLoggerModule, PrettyLoggerModule],
  configs: [LoggerConfig],
  providers: [Logger, LoggerService],
  exports: [Logger],
})
export class LoggerModule {}
