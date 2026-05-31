import { Module, UsePrefix } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { BarModule } from './bar';
import { FooController } from './foo.controller';

@Module({
  imports: [BarModule],
  controllers: [FooController],
})
@UsePrefix('foo')
@UseCORS({
  maxAge: 3600,
  credentials: false,
})
export class FooModule {}
