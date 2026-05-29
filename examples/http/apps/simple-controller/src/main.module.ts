import { Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FooModule } from './foo';

@Module({
  imports: [ExampleModule.forRoot('simple-controller'), FooModule],
})
export class MainModule {}
