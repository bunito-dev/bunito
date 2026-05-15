import { App } from '@bunito/bunito';
import { AppController } from './app-controller';
import { BarModule } from './bar-module';

await App.start({
  imports: [BarModule],
  controllers: [AppController],
});
