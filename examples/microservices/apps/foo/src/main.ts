import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FooModule } from './foo.module';

await App.start({
  imports: [ExampleModule.forRoot('foo'), FooModule],
});
