import { BunServerModule } from '@bunito/bun';
import { Module } from '@bunito/container';
import { BodyParserModule, JSONSerializerModule } from './bundled';
import { HTTPBunServerRouter } from './http.bun-server-router';
import { HTTPConfig } from './http.config';

@Module({
  imports: [BunServerModule, BodyParserModule, JSONSerializerModule],
  configs: [HTTPConfig],
  extensions: [HTTPBunServerRouter],
})
export class HTTPModule {}
