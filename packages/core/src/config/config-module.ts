import { defineModule } from '../container';
import { ConfigService } from './config-service';

export const ConfigModule = defineModule('ConfigModule', {
  providers: [ConfigService],
  exports: [ConfigService],
});
