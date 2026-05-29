import type { ModuleOptions } from '@bunito/container';
import { BunSecretsConfigReader } from '../bun-secrets.config-reader';
import { BunSecretsModule } from '../bun-secrets.module';
import { BunSecretsService } from '../bun-secrets.service';

export function testBunSecretsModule(this: Bunito.Test): ModuleOptions {
  return {
    token: BunSecretsModule,
    providers: [
      {
        token: BunSecretsService,
        useValue: this.bunSecretsService,
      },
    ],
    extensions: [BunSecretsConfigReader],
    exports: [BunSecretsService],
  };
}
