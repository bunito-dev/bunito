import { ConfigModule, LoggerModule, Module } from '@bunito/core';
import { RoutingConfig } from './routing.config';
import { RoutingService } from './routing.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [RoutingConfig, RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
