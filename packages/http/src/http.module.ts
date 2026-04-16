import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { ServerModule } from '@bunito/server';
import { HttpConfig } from './http.config';
import { HttpRouter } from './http.router';

@Module({
  imports: [ConfigModule, ServerModule],
  uses: [HttpConfig, HttpRouter],
  exports: [HttpRouter],
})
export class HttpModule {}
