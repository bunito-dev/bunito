import { LoggerModule, Module, ServerModule } from '@bunito/core';
import { HttpModule } from '@bunito/http';
import { FooModule } from './foo';

// The root module wires together infrastructure modules and the feature module.
@Module({
  imports: [LoggerModule, ServerModule, HttpModule, FooModule],
})
export class AppModule {}
