import { App, LoggerModule } from '@bunito/bunito';
import { SecondModule } from './second.module';

await App.start({
  imports: [LoggerModule, SecondModule],
});
