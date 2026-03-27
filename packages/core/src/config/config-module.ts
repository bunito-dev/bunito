import type { ModuleOptions } from '../container';
import { ConfigService } from './config-service';

export const configModule: ModuleOptions = {
  providers: [ConfigService],
  exports: [ConfigService],
};
