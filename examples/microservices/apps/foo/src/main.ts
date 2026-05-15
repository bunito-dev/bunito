import { App } from '@bunito/bunito';
import { AppController } from './app-controller';
import { FooModule } from './foo-module';

await App.start({
  imports: [FooModule],
  controllers: [AppController],
});
