import './globals';

import { defineTestFactory } from '@bunito/testing';
import { testConfigModule } from './test-config-module';
import { testConfigService } from './test-config-service';

defineTestFactory('ConfigModule', testConfigModule);
defineTestFactory('configService', testConfigService);
