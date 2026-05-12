import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { BrokerConfig } from './broker-config';
import { BrokerService } from './broker-service';

@Module({
  imports: [ConfigModule],
  configs: [BrokerConfig],
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule {}
