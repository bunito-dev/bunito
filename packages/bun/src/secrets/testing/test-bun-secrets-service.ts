import { mockClass } from '@bunito/testing';
import { BunSecretsService } from '../bun-secrets.service';
import type { TestBunSecretsService } from './types';

export function testBunSecretsService(): TestBunSecretsService {
  return mockClass(BunSecretsService);
}
