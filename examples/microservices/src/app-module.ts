import { BarModule } from '@apps/bar';
import { FooModule } from '@apps/foo';
import { BrokerModule, LocalBrokerModule } from '@bunito/broker';
import { Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppController } from './app-controller';

@Module({
  imports: [BrokerModule, LocalBrokerModule, HTTPModule, BarModule, FooModule],
  controllers: [AppController],
})
export class AppModule {}
