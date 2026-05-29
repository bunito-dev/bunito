import { mockClass } from '@bunito/testing';
import { ConfigService } from '../config.service';
import type { TestConfigService } from './types';

export function testConfigService(): TestConfigService {
  return mockClass(ConfigService);
}
