import './globals';

import { feature } from 'bun:bundle';
import { defineTestFactory, mockClass } from '@bunito/testing';
import { BunSecretsService } from '../bun-secrets.service';
import { testBunSecretsModule } from './test-bun-secrets-module';

if (!feature('RUNTIME_ONLY')) {
  defineTestFactory('BunSecretsModule', testBunSecretsModule);
  defineTestFactory('bunSecretsService', () => mockClass(BunSecretsService));
}
