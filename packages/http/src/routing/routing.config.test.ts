import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/core';
import { RoutingConfig } from './routing.config';

describe('RoutingConfig', () => {
  it('should default to application/json', async () => {
    expect(await RoutingConfig.useFactory(new ConfigService())).toEqual({
      defaultContentType: 'application/json',
    });
  });

  it('should accept configured default content types', async () => {
    const service = {
      getEnvAs() {
        return 'text/plain';
      },
    } as unknown as ConfigService;

    expect(await RoutingConfig.useFactory(service)).toEqual({
      defaultContentType: 'text/plain',
    });
  });
});
