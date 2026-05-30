import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { BarModule } from './bar.module';

await App.start({
  imports: [ExampleModule.forRoot('bar'), BarModule],
});
