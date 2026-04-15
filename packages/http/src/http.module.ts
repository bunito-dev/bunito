import { ConfigModule, Module } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpRouter } from './http.router';

@Module({
  imports: [ConfigModule],
  configs: [HttpConfig],
  routers: [HttpRouter],
  exports: [HttpRouter],
})
export class HttpModule {}
