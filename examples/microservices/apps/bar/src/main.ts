import { startApp } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { BarModule } from './bar.module';

await startApp({
  imports: [ExampleModule.forRoot('bar'), BarModule],
});
