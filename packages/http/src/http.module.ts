import { ConfigModule, LoggerModule, Module } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpService } from './http.service';
import { RoutingModule } from './routing';

@Module({
  imports: [LoggerModule, ConfigModule, RoutingModule],
  providers: [HttpConfig, HttpService],
  exports: [HttpService],
})
export class HttpModule {}
