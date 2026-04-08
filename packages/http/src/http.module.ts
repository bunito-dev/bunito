import { ConfigModule, defineModule, LoggerModule } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpService } from './http.service';
import { RoutingModule } from './routing';

export const HttpModule = defineModule('HttpModule', {
  imports: [LoggerModule, ConfigModule, RoutingModule],
  providers: [HttpConfig, HttpService],
  exports: [HttpService],
});
