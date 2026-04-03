import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { configModule, LoggerModule } from '@bunito/core';
import {
  MODULE_METADATA_KEY,
  PROVIDER_HOOK_METADATA_KEYS,
  PROVIDER_METADATA_KEY,
} from '../../core/src/container/constants';
import { HttpConfig } from './httpConfig';
import { HttpModule } from './http.module';
import { HttpService } from './http.service';

describe('HttpModule', () => {
  it('should register module metadata and provider hooks', () => {
    expect(getDecoratorMetadata<unknown>(HttpModule, MODULE_METADATA_KEY)).toEqual({
      imports: [LoggerModule, configModule],
      providers: [HttpService, HttpConfig],
      exports: [HttpService],
    });
    expect(getDecoratorMetadata<unknown>(HttpModule, PROVIDER_METADATA_KEY)).toEqual({
      scope: 'module',
      injects: [HttpService],
      useClass: HttpModule,
    });
    expect(
      getDecoratorMetadata<Set<PropertyKey>>(
        HttpModule,
        PROVIDER_HOOK_METADATA_KEYS.bootstrap,
      ),
    ).toEqual(new Set(['bootstrap']));
    expect(
      getDecoratorMetadata<Set<PropertyKey>>(
        HttpModule,
        PROVIDER_HOOK_METADATA_KEYS.destroy,
      ),
    ).toEqual(new Set(['destroy']));
  });

  it('should delegate bootstrap and destroy to HttpService', async () => {
    const calls: Array<string> = [];
    const module = new HttpModule({
      startServer() {
        calls.push('start');
      },
      stop: async () => {
        calls.push('stop');
      },
    } as HttpService);

    module.bootstrap();
    await module.destroy();

    expect(calls).toEqual(['start', 'stop']);
  });
});
