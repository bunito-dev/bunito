import type { ModuleOptions } from '@bunito/core';
import { ConfigModule, LoggerModule } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpRouter } from './http.router';
import { HttpService } from './http.service';

export const HttpModule: ModuleOptions = {
  imports: [LoggerModule, ConfigModule],
  providers: [HttpConfig, HttpRouter, HttpService],
  exports: [HttpRouter, HttpService],
};
