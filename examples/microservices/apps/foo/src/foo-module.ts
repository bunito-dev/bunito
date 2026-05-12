import { BrokerModule, LocalBrokerModule, NatsBrokerModule } from '@bunito/broker';
import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONSerializer, UseMiddleware } from '@bunito/http';
import { FooController } from './foo-controller';

@Module({
  imports: [BrokerModule, LocalBrokerModule, NatsBrokerModule, LoggerModule, HTTPModule],
  controllers: [FooController],
})
@UseMiddleware(JSONSerializer)
export class FooModule {}
