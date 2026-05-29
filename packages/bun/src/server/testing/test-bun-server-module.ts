import type { ModuleOptions } from '@bunito/container';
import { BunServerService } from '../bun-server.service';
import { BUN_SERVER_FACTORY_ID } from '../constants';

export function testBunServerModule(this: Bunito.Test): ModuleOptions {
  return {
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
