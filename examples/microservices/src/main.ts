import { BarModule } from '@apps/bar';
import { FooModule } from '@apps/foo';
import { startApp } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';

await startApp({
  imports: [ExampleModule.forRoot('composed'), FooModule, BarModule],
});
