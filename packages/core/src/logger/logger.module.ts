import { ConfigModule } from '../config';
import { Module } from '../container';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  providers: [LoggerConfig, Logger, LoggerService],
  exports: [Logger],
})
export class LoggerModule {}
