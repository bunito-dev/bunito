import { Module, UsePrefix } from '@bunito/bunito';
import { FooController } from './foo-controller';

@Module({
  controllers: [FooController],
})
// The prefix is applied to every controller route declared by this module.
@UsePrefix('/foo')
export class FooModule {}
