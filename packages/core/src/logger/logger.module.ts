import { ConfigModule } from '../config';
import { defineModule } from '../container';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

export const LoggerModule = defineModule('LoggerModule', {
  imports: [ConfigModule],
  providers: [LoggerConfig, Logger, LoggerService],
  exports: [Logger],
});
