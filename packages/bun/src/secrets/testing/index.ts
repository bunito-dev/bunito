import './globals';

import { defineTestFactory } from '@bunito/testing';
import { testBunSecretsModule } from './test-bun-secrets-module';
import { testBunSecretsService } from './test-bun-secrets-service';

defineTestFactory('BunSecretsModule', testBunSecretsModule);
defineTestFactory('bunSecretsService', testBunSecretsService);
