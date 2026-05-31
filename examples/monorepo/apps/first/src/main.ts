import { App, LoggerModule } from '@bunito/bunito';
import { FirstModule } from './first.module';

await App.start({
  imports: [LoggerModule, FirstModule],
});
