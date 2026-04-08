import { ConfigModule, defineModule, LoggerModule } from '@bunito/core';
import { RoutingConfig } from './routing.config';
import { RoutingService } from './routing.service';

export const RoutingModule = defineModule('RoutingModule', {
  imports: [ConfigModule, LoggerModule],
  providers: [RoutingConfig, RoutingService],
  exports: [RoutingService],
});
