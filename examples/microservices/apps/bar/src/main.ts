import { BrokerModule, LocalBrokerModule, NatsBrokerModule } from '@bunito/broker';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppController } from './app-controller';
import { BarModule } from './bar-module';

await App.start({
  imports: [BrokerModule, LocalBrokerModule, NatsBrokerModule, HTTPModule, BarModule],
  controllers: [AppController],
});
