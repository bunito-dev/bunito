import { BrokerModule, LocalBrokerModule, NatsBrokerModule } from '@bunito/broker';
import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONSerializer, UseMiddleware } from '@bunito/http';
import { BarController } from './bar-controller';

@Module({
  imports: [BrokerModule, LocalBrokerModule, NatsBrokerModule, LoggerModule, HTTPModule],
  controllers: [BarController],
})
@UseMiddleware(JSONSerializer)
export class BarModule {}
