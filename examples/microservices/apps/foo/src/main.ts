import { BrokerModule, LocalBrokerModule, NatsBrokerModule } from '@bunito/broker';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppController } from './app-controller';
import { FooModule } from './foo-module';

await App.start({
  imports: [BrokerModule, LocalBrokerModule, NatsBrokerModule, HTTPModule, FooModule],
  controllers: [AppController],
});
