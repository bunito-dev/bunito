import type { ModuleOptions } from '@bunito/container';
import { ConfigModule } from '../config.module';
import { ConfigService } from '../config.service';

export function testConfigModule(this: Bunito.Test): ModuleOptions {
  return {
    token: ConfigModule,
    providers: [
      {
        token: ConfigService,
        global: true,
        useValue: this.configService,
      },
    ],
    exports: [ConfigService],
  };
}
