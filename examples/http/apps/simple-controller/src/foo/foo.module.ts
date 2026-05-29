import { Module } from '@bunito/bunito';
import { FooController } from './foo.controller';
import { FooService } from './foo.service';

@Module({
  providers: [FooService],
  controllers: [FooController],
})
export class FooModule {}
