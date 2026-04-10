import { LoggerModule, Module } from '@bunito/core';
import { HttpModule, RoutingModule } from '@bunito/http';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, HttpModule, FooModule, RoutingModule],
})
export class AppModule {}
