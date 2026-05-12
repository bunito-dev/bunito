import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { JSONFormatterModule, PrettyFormatterModule } from './bundled';
import { Logger } from './logger';
import { LoggerConfig } from './logger-config';
import { LoggerService } from './logger-service';

@Module({
  imports: [ConfigModule, JSONFormatterModule, PrettyFormatterModule],
  configs: [LoggerConfig],
  providers: [Logger, LoggerService],
  exports: [Logger],
})
export class LoggerModule {}
