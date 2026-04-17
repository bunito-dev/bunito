import { Module } from '@bunito/bunito';
import { FooController } from './foo.controller';

@Module({
  uses: [FooController],
})
export class FooModule {}
