import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { LocalBroker } from './local-broker';
import { LocalBrokerConfig } from './local-broker-config';

@Module({
  imports: [ConfigModule],
  configs: [LocalBrokerConfig],
  extensions: [LocalBroker],
})
export class LocalBrokerModule {}
