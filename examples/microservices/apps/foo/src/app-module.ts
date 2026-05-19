import { BrokerModule, LocalBrokerModule, NatsBrokerModule } from '@bunito/broker';
import { ConfigModule, LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { FooModule } from './foo-module';

@Module({
  imports: [
    ConfigModule,
    BrokerModule,
    LocalBrokerModule,
    NatsBrokerModule,
    LoggerModule,
    HTTPModule,
    FooModule,
  ],
})
export class AppModule {}
