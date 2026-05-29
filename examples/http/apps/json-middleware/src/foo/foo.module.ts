import { Module } from '@bunito/bunito';
import { FooController } from './foo.controller';

@Module({
  controllers: [FooController],
})
export class FooModule {}
