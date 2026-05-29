import { Module } from '@bunito/container';
import { JSONSerializer } from './json-serializer';

@Module({
  extensions: [JSONSerializer],
})
export class JSONSerializerModule {}
