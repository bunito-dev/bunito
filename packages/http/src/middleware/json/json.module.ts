import { Module } from '@bunito/container';
import { JSONMiddleware } from './json-middleware';

@Module({
  extensions: [JSONMiddleware],
})
export class JSONModule {}
