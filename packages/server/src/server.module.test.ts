import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { ServerConfig } from './server.config';
import { ServerModule } from './server.module';
import { ServerService } from './server.service';

describe('ServerModule', () => {
  it('registers server config, service, and exports', () => {
    expect(getDecoratorMetadata(ServerModule, 'module')).toEqual({
      imports: [ConfigModule],
      configs: [ServerConfig],
      providers: [ServerService],
      exports: [ServerService],
    });
  });
});
