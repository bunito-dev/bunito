import './globals';

import { defineTestFactory } from '@bunito/testing';
import { testLoggerGetter } from './test-logger-getter';
import { testLoggerModule } from './test-logger-module';

defineTestFactory('LoggerModule', testLoggerModule);
defineTestFactory('getLogger', testLoggerGetter);
