import { BrokerModule, LocalBrokerModule, NatsBrokerModule } from '@bunito/broker';
import { ConfigModule, LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { BarModule } from './bar-module';

@Module({
  imports: [
    ConfigModule,
    BrokerModule,
    LocalBrokerModule,
    NatsBrokerModule,
    LoggerModule,
    HTTPModule,
    BarModule,
  ],
})
export class AppModule {}
