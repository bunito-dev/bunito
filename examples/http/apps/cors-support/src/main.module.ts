import { Module } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { ExampleModule } from '@libs/example';
import { FooModule } from './foo';

@Module({
  imports: [ExampleModule.forRoot('cors-support'), FooModule],
})
@UseCORS({
  origin: '*',
  credentials: true,
})
export class MainModule {}
