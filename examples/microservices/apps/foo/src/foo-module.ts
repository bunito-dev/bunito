import { Module } from '@bunito/bunito';
import { JSONSerializer, UseMiddleware } from '@bunito/http';
import { FooController } from './foo-controller';

@Module({
  controllers: [FooController],
})
@UseMiddleware(JSONSerializer)
export class FooModule {}
