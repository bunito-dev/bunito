import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { AppModule } from './app.module';

await App.start({
  imports: [ExampleModule.forRoot('simple-controller'), AppModule],
});
