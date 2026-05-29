import type { ModuleOptions } from '@bunito/container';
import { Logger } from '../logger';
import { LoggerModule } from '../logger.module';
import { TestLogger } from './test-logger';

export function testLoggerModule(): ModuleOptions {
  return {
    token: LoggerModule,
    providers: [TestLogger],
    exports: [Logger],
  };
}
