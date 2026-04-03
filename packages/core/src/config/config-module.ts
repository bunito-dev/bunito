import type { ModuleOptions } from '../container';
import { ConfigService } from './config-service';

export const ConfigModule: ModuleOptions = {
  providers: [ConfigService],
  exports: [ConfigService],
};
