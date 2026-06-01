import './globals';

import { feature } from 'bun:bundle';
import { defineTestFactory } from '@bunito/testing';
import { TestBroker } from './test-broker';
import { testBrokerModule } from './test-broker-module';

if (!feature('RUNTIME_ONLY')) {
  defineTestFactory('BrokerModule', testBrokerModule);
  defineTestFactory('broker', () => new TestBroker());
}
