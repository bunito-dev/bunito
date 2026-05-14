import { Module, UsePrefix } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { FooController } from './foo-controller';

@Module({
  controllers: [FooController],
})
@UsePrefix('foo')
@UseCORS({
  maxAge: 3600,
  credentials: false,
})
export class FooModule {}
