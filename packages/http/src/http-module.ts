import { ServerModule } from '@bunito/bun';
import { Module } from '@bunito/container';
import { BodyParserModule, JSONSerializerModule } from './bundled';
import { HTTPConfig } from './http-config';
import { HTTPServerRouter } from './http-server-router';

@Module({
  imports: [ServerModule, BodyParserModule, JSONSerializerModule],
  configs: [HTTPConfig],
  extensions: [HTTPServerRouter],
})
export class HTTPModule {}
