import { configModule } from '../config';
import type { ModuleOptions } from '../container';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';

export const LoggerModule: ModuleOptions = {
  imports: [configModule],
  providers: [LoggerConfig, Logger],
  exports: [Logger],
};
