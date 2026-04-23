import { Module } from '@bunito/container';
import { JSONMiddleware } from './json.middleware';

@Module({
  providers: [JSONMiddleware],
})
export class JSONModule {}
