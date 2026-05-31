import { Module } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { FooModule } from './foo';

@Module({
  imports: [FooModule],
})
@UseCORS({
  origin: '*',
  credentials: true,
})
export class AppModule {}
