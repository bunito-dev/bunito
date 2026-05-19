import { Module } from '@bunito/container';
import { JSONTransformModule, PrettyTransformModule } from './bundled';
import { Logger } from './logger';
import { LoggerConfig } from './logger-config';
import { LoggerService } from './logger-service';

@Module({
  imports: [PrettyTransformModule, JSONTransformModule],
  configs: [LoggerConfig],
  providers: [Logger, LoggerService],
  exports: [Logger],
})
export class LoggerModule {}
