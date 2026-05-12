import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { NatsBroker } from './nats-broker';
import { NatsBrokerConfig } from './nats-broker-config';

@Module({
  imports: [ConfigModule],
  configs: [NatsBrokerConfig],
  extensions: [NatsBroker],
})
export class NatsBrokerModule {}
