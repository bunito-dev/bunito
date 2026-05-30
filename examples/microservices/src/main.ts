import { BarModule } from '@apps/bar';
import { FooModule } from '@apps/foo';
import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';

await App.start({
  imports: [ExampleModule.forRoot('composed'), FooModule, BarModule],
});
