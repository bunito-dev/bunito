import { Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FooModule } from './foo';

@Module({
  imports: [ExampleModule.forRoot('json-middleware'), FooModule],
})
export class MainModule {}
