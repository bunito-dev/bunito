import type { ModuleOptions } from '@bunito/core';
import { LoggerModule } from '@bunito/core';
import { RoutingService } from './routing.service';

export const RoutingModule: ModuleOptions = {
  imports: [LoggerModule],
  providers: [RoutingService],
  exports: [RoutingService],
};
