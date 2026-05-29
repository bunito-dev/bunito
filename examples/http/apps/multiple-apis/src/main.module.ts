import { Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { BarModule } from './bar';
import { FooModule } from './foo';

@Module({
  imports: [ExampleModule.forRoot('multiple-apis'), FooModule, BarModule],
})
export class MainModule {}
