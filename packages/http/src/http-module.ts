import { ServerModule } from '@bunito/bun';
import { Module } from '@bunito/container';
import { BodyParserModule, JSONSerializerModule } from './bundled';
import { HTTPConfig } from './http-config';
import { HTTPRouter } from './http-router';

@Module({
  imports: [ServerModule, BodyParserModule, JSONSerializerModule],
  configs: [HTTPConfig],
  extensions: [HTTPRouter],
})
export class HTTPModule {}
