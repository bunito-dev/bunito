import { startApp } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FooModule } from './foo.module';

await startApp({
  imports: [ExampleModule.forRoot('foo'), FooModule],
});
