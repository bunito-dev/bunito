import './globals';

import { feature } from 'bun:bundle';
import { defineTestFactory } from '@bunito/testing';
import { defineTestConfig } from './define-test-config';
import { testConfigModule } from './test-config-module';
import { testConfigService } from './test-config-service';

if (!feature('RUNTIME_ONLY')) {
  defineTestFactory('ConfigModule', testConfigModule);
  defineTestFactory('configService', testConfigService);
  defineTestFactory('defineConfig', () => defineTestConfig);
}
