import './globals';

import { feature } from 'bun:bundle';
import { defineTestFactory } from '@bunito/testing';
import { testLoggerGetter } from './test-logger-getter';
import { testLoggerModule } from './test-logger-module';

if (!feature('RUNTIME_ONLY')) {
  defineTestFactory('LoggerModule', testLoggerModule);
  defineTestFactory('getLogger', testLoggerGetter);
}
