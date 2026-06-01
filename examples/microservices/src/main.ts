import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { ComposedModule } from './composed.module';

await App.start({
  imports: [ExampleModule.forRoot('composed'), ComposedModule],
});
