import type { ModuleOptions } from '@bunito/container';
import { BrokerConfig } from '../broker.config';
import { BrokerModule } from '../broker.module';
import { BrokerService } from '../broker.service';
import { TestBroker } from './test-broker';

export function testBrokerModule(this: Bunito.Test): ModuleOptions {
  return {
    token: BrokerModule,
    configs: [
      this.defineConfig(BrokerConfig, {
        adapter: 'TESTING',
      }),
    ],
    providers: [BrokerService],
    extensions: [
      {
        token: TestBroker,
        useValue: this.broker,
      },
    ],
    exports: [BrokerService],
  };
}
