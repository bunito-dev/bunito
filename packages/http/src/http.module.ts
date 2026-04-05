import type { ModuleOptions } from '@bunito/core';
import { ConfigModule, LoggerModule } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpService } from './http.service';
import { RoutingModule, RoutingService } from './routing';

export const HttpModule: ModuleOptions = {
  imports: [LoggerModule, ConfigModule, RoutingModule],
  providers: [HttpConfig, HttpService],
  exports: [HttpService, RoutingService],
};
