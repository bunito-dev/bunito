import type { ModuleOptions } from '@bunito/container';
import { BunServerConfig } from '../bun-server.config';
import { BunServerModule } from '../bun-server.module';
import { BunServerService } from '../bun-server.service';
import { BUN_SERVER_FACTORY_ID } from '../constants';

export function testBunServerModule(this: Bunito.Test): ModuleOptions {
  return {
    token: BunServerModule,
    configs: [BunServerConfig],
    providers: [
      BunServerService,
      {
        token: BUN_SERVER_FACTORY_ID,
        useValue: this.bunServerFactory,
      },
    ],
    exports: [BunServerService],
  };
}
